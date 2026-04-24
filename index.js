require('dotenv').config();

const TOKEN = process.env.DISCORD_TOKEN;
const PREFIX = process.env.PREFIX || '!';  // Eğer .env'de yoksa ! kullan

if (!TOKEN) {
    console.error('❌ HATA: DISCORD_TOKEN .env dosyasında bulunamadı!');
    console.error('Lütfen .env dosyası oluştur ve DISCORD_TOKEN=xxx şeklinde token\'ı ekle.');
    process.exit(1);
}

const { 
    Client, 
    GatewayIntentBits, 
    Events,
    EmbedBuilder 
} = require('discord.js');
const {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus,
    VoiceConnectionStatus,
    entersState,
    getVoiceConnection,
    StreamType
} = require('@discordjs/voice');
const { YouTube } = require('youtube-sr');
const { spawn } = require('child_process');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
});

const players = new Map();

client.once(Events.ClientReady, () => {
    console.log(`✅ ${client.user.tag} hazır!`);
});

// yt-dlp ile stream URL'sini al
async function getStreamUrl(videoUrl) {
    return new Promise((resolve, reject) => {
        const ytdlp = spawn('yt-dlp', [
            '-f', 'bestaudio[ext=webm]/bestaudio',
            '-g',
            '--no-playlist',
            '--no-warnings',
            videoUrl
        ]);

        let url = '';
        let errorOutput = '';

        ytdlp.stdout.on('data', (data) => {
            url += data.toString();
        });

        ytdlp.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        ytdlp.on('close', (code) => {
            if (code === 0) {
                resolve(url.trim().split('\n')[0]);
            } else {
                reject(new Error(`yt-dlp hata: ${errorOutput}`));
            }
        });

        ytdlp.on('error', (err) => {
            reject(new Error(`yt-dlp bulunamadı: ${err.message}`));
        });
    });
}

client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot || !message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // !join
    if (command === 'join') {
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) return message.reply('❌ Ses kanalına katıl!');

        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator,
        });

        try {
            await entersState(connection, VoiceConnectionStatus.Ready, 10_000);
            message.reply(`✅ **${voiceChannel.name}** kanalına bağlandım!`);
        } catch (error) {
            connection.destroy();
            message.reply(`❌ Hata: ${error.message}`);
        }
    }

    // !play
    else if (command === 'play' || command === 'p') {
        if (!args.length) return message.reply('❌ Kullanım: `!play <url veya arama>`');

        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) return message.reply('❌ Ses kanalına katıl!');

        const query = args.join(' ');

        try {
            await message.reply('🔍 Aranıyor...');

            // Değişkenler scope dışında
            let videoUrl;
            let videoTitle;
            let videoThumbnail = null;
            let videoDuration = 'Bilinmiyor';

            // URL kontrolü
            if (query.includes('youtube.com') || query.includes('youtu.be')) {
                videoUrl = query;
                console.log('[DEBUG] URL modu:', videoUrl);
                try {
                    const video = await YouTube.getVideo(query);
                    videoTitle = video.title;
                    videoThumbnail = video.thumbnail?.url;
                    videoDuration = video.durationFormatted || 'Bilinmiyor';
                    console.log('[DEBUG] Video bulundu:', videoTitle);
                } catch (e) {
                    console.log('[DEBUG] getVideo hatası:', e.message);
                    videoTitle = 'YouTube Video';
                }
            } else {
                console.log('[DEBUG] Arama modu:', query);
                const video = await YouTube.searchOne(query);
                if (!video) return message.channel.send('❌ Video bulunamadı!');
                videoUrl = video.url;
                videoTitle = video.title;
                videoThumbnail = video.thumbnail?.url;
                videoDuration = video.durationFormatted || 'Bilinmiyor';
                console.log('[DEBUG] Bulunan URL:', videoUrl);
            }

            message.channel.send(`⏬ **${videoTitle}** hazırlanıyor...`);

            console.log('[DEBUG] yt-dlp çağrılıyor');
            const streamUrl = await getStreamUrl(videoUrl);
            console.log('[DEBUG] Stream URL alındı');

            // Kanala bağlan
            let connection = getVoiceConnection(message.guild.id);
            if (!connection) {
                console.log('[DEBUG] Yeni bağlantı kuruluyor');
                connection = joinVoiceChannel({
                    channelId: voiceChannel.id,
                    guildId: message.guild.id,
                    adapterCreator: message.guild.voiceAdapterCreator,
                });
                await entersState(connection, VoiceConnectionStatus.Ready, 10_000);
                console.log('[DEBUG] Bağlantı hazır');
            }

            const resource = createAudioResource(streamUrl, {
                inputType: StreamType.Arbitrary,
            });
            console.log('[DEBUG] Resource oluşturuldu');

            let player = players.get(message.guild.id);
            if (!player) {
                player = createAudioPlayer();
                players.set(message.guild.id, player);

                player.on(AudioPlayerStatus.Idle, () => {
                    console.log('Çalma bitti');
                });

                player.on('error', error => {
                    console.error('[PLAYER HATA]:', error);
                    message.channel.send(`❌ Çalma hatası: ${error.message}`);
                });
            }

            player.play(resource);
            connection.subscribe(player);
            console.log('[DEBUG] Play çağrıldı');

            // ✅ EMBED
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('🎵 Şimdi Çalıyor')
                .setDescription(`**${videoTitle}**`)
                .addFields(
                    { name: '⏱️ Süre', value: videoDuration, inline: true },
                    { name: '👤 İsteyen', value: message.author.username, inline: true },
                    { name: '🔗 Link', value: `[YouTube](${videoUrl})`, inline: true }
                )
                .setFooter({ text: 'teXas Bot', iconURL: client.user.displayAvatarURL() })
                .setTimestamp();

            // Thumbnail varsa ekle
            if (videoThumbnail) {
                embed.setThumbnail(videoThumbnail);
            }

            message.channel.send({ embeds: [embed] });

        } catch (error) {
            console.error('[ANA HATA]:', error);
            console.error('[STACK]:', error.stack);
            message.channel.send(`❌ Hata: ${error.message}`);
        }
    }

    // !stop
    else if (command === 'stop') {
        const player = players.get(message.guild.id);
        if (player) {
            player.stop();
            message.reply('⏹️ Durduruldu');
        } else {
            message.reply('❌ Çalan bir şey yok');
        }
    }

    // !pause
    else if (command === 'pause') {
        const player = players.get(message.guild.id);
        if (player) {
            player.pause();
            message.reply('⏸️ Duraklatıldı');
        }
    }

    // !resume
    else if (command === 'resume') {
        const player = players.get(message.guild.id);
        if (player) {
            player.unpause();
            message.reply('▶️ Devam ediyor');
        }
    }

    // !leave
    else if (command === 'leave' || command === 'dc') {
        const connection = getVoiceConnection(message.guild.id);
        if (connection) {
            connection.destroy();
            players.delete(message.guild.id);
            message.reply('👋 Ayrıldım');
        } else {
            message.reply('❌ Zaten kanalda değilim');
        }
    }

    // !ping
    else if (command === 'ping') {
        message.reply(`🏓 ${client.ws.ping}ms`);
    }
});

client.login(TOKEN);