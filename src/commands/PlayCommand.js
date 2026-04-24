const BaseCommand = require('./BaseCommand');
const EmbedHelper = require('../utils/EmbedHelper');

class PlayCommand extends BaseCommand {
    /**
     * @param {import('../services/ConnectionService')} connectionService
     * @param {import('../services/PlayerService')}    playerService
     * @param {import('../services/YouTubeService')}   youTubeService
     * @param {import('../services/QueueService')}     queueService
     * @param {import('discord.js').Client}            client
     */
    constructor(connectionService, playerService, youTubeService, queueService, client) {
        super({
            name: 'play',
            aliases: ['p'],
            description: 'YouTube URL veya arama terimiyle müzik çalar. Çalarken sıraya ekler.',
        });
        this._connection = connectionService;
        this._player    = playerService;
        this._youtube   = youTubeService;
        this._queue     = queueService;
        this._client    = client;
    }

    async execute(message, args) {
        if (!args.length) {
            return message.reply('❌ Kullanım: `!play <url veya arama>`');
        }

        if (!message.member?.voice?.channel) {
            return message.reply('❌ Önce bir ses kanalına katılman gerekiyor!');
        }

        const query   = args.join(' ');
        const guildId = message.guild.id;

        try {
            await message.reply('🔍 Aranıyor...');

            // 1) Video metadata'sını çöz
            const video = await this._youtube.resolve(query);

            /** @type {import('../services/QueueService').Song} */
            const song = {
                title:     video.title,
                url:       video.url,
                duration:  video.duration,
                thumbnail: video.thumbnail,
                requester: message.author.username,
            };

            // 2) Zaten çalıyorsa kuyruğa ekle
            if (this._player.isPlaying(guildId)) {
                this._queue.enqueue(guildId, song, message.channel);
                const position = this._queue.size(guildId);

                const embed = EmbedHelper.addedToQueue({
                    title:        song.title,
                    url:          song.url,
                    duration:     song.duration,
                    requester:    song.requester,
                    thumbnail:    song.thumbnail,
                    position,
                    botAvatarURL: this._client.user.displayAvatarURL(),
                });
                return message.channel.send({ embeds: [embed] });
            }

            // 3) Boştaysa hemen çal
            await message.channel.send(`⏬ **${song.title}** hazırlanıyor...`);
            const streamUrl  = await this._youtube.getStreamUrl(song.url);
            const connection = await this._connection.connect(message);

            this._queue.setChannel(guildId, message.channel);
            this._setupIdleCallback(guildId);

            this._player.play(guildId, streamUrl, connection, message.channel);

            const embed = EmbedHelper.nowPlaying({
                title:        song.title,
                url:          song.url,
                duration:     song.duration,
                requester:    song.requester,
                thumbnail:    song.thumbnail,
                botAvatarURL: this._client.user.displayAvatarURL(),
            });
            message.channel.send({ embeds: [embed] });

        } catch (err) {
            console.error('[PlayCommand] Hata:', err.message);
            message.channel.send(`❌ Hata: ${err.message}`);
        }
    }

    /**
     * Guild için idle callback'i kur.
     * Şarkı bitince kuyruktan bir sonraki şarkıyı otomatik çalar.
     * Her guild için yalnızca bir kez kurulması yeterli; sonraki çağrılar üzerine yazar (sorunsuz).
     *
     * @param {string} guildId
     */
    _setupIdleCallback(guildId) {
        this._player.setIdleCallback(guildId, async () => {
            const next = this._queue.dequeue(guildId);
            if (!next) {
                console.log(`[PlayCommand] Guild ${guildId} — kuyruk bitti.`);
                return;
            }

            const channel = this._queue.getChannel(guildId);
            try {
                await channel?.send(`⏬ **${next.title}** hazırlanıyor...`);
                const streamUrl  = await this._youtube.getStreamUrl(next.url);
                const connection = this._connection.get(guildId);
                if (!connection) {
                    channel?.send('❌ Ses bağlantısı bulunamadı, kuyruk durdu.');
                    return;
                }

                this._player.play(guildId, streamUrl, connection, channel);

                const embed = EmbedHelper.nowPlaying({
                    title:        next.title,
                    url:          next.url,
                    duration:     next.duration,
                    requester:    next.requester,
                    thumbnail:    next.thumbnail,
                    botAvatarURL: this._client.user.displayAvatarURL(),
                });
                channel?.send({ embeds: [embed] });

            } catch (err) {
                console.error('[PlayCommand] Sonraki şarkı hatası:', err.message);
                channel?.send(`❌ Sonraki şarkı yüklenemedi: ${err.message}`);
            }
        });
    }
}

module.exports = PlayCommand;
