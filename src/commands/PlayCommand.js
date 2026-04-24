const BaseCommand = require('./BaseCommand');
const EmbedHelper = require('../utils/EmbedHelper');

class PlayCommand extends BaseCommand {
    /**
     * @param {import('../services/ConnectionService')} connectionService
     * @param {import('../services/PlayerService')}    playerService
     * @param {import('../services/YouTubeService')}   youTubeService
     * @param {import('discord.js').Client}            client
     */
    constructor(connectionService, playerService, youTubeService, client) {
        super({
            name: 'play',
            aliases: ['p'],
            description: 'YouTube URL veya arama terimiyle müzik çalar.',
        });
        this._connection = connectionService;
        this._player    = playerService;
        this._youtube   = youTubeService;
        this._client    = client;
    }

    async execute(message, args) {
        if (!args.length) {
            return message.reply('❌ Kullanım: `!play <url veya arama>`');
        }

        if (!message.member?.voice?.channel) {
            return message.reply('❌ Önce bir ses kanalına katılman gerekiyor!');
        }

        const query = args.join(' ');

        try {
            await message.reply('🔍 Aranıyor...');

            // 1) Video metadata'sı çöz
            const video = await this._youtube.resolve(query);
            await message.channel.send(`⏬ **${video.title}** hazırlanıyor...`);

            // 2) Stream URL'si al
            const streamUrl = await this._youtube.getStreamUrl(video.url);

            // 3) Ses bağlantısı kur (yoksa)
            const connection = await this._connection.connect(message);

            // 4) Çal
            this._player.play(
                message.guild.id,
                streamUrl,
                connection,
                message.channel,
            );

            // 5) "Şimdi Çalıyor" embed'i gönder
            const embed = EmbedHelper.nowPlaying({
                title:       video.title,
                url:         video.url,
                duration:    video.duration,
                requester:   message.author.username,
                thumbnail:   video.thumbnail,
                botAvatarURL: this._client.user.displayAvatarURL(),
            });

            message.channel.send({ embeds: [embed] });

        } catch (err) {
            console.error('[PlayCommand] Hata:', err.message);
            message.channel.send(`❌ Hata: ${err.message}`);
        }
    }
}

module.exports = PlayCommand;
