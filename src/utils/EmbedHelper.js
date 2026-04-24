const { EmbedBuilder } = require('discord.js');

/**
 * EmbedHelper — Tekrar eden Discord embed oluşturma mantığını merkezi hale getirir.
 */
class EmbedHelper {
    /**
     * "Şimdi Çalıyor" embed'i oluştur.
     *
     * @param {object} params
     * @param {string} params.title
     * @param {string} params.url
     * @param {string} params.duration
     * @param {string} params.requester
     * @param {string|null} params.thumbnail
     * @param {string} params.botAvatarURL
     * @returns {EmbedBuilder}
     */
    static nowPlaying({ title, url, duration, requester, thumbnail, botAvatarURL }) {
        const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('🎵 Şimdi Çalıyor')
            .setDescription(`**${title}**`)
            .addFields(
                { name: '⏱️ Süre',    value: duration,              inline: true },
                { name: '👤 İsteyen', value: requester,              inline: true },
                { name: '🔗 Link',    value: `[YouTube](${url})`,   inline: true },
            )
            .setFooter({ text: 'teXas Bot', iconURL: botAvatarURL })
            .setTimestamp();

        if (thumbnail) embed.setThumbnail(thumbnail);
        return embed;
    }

    /**
     * Hata embed'i oluştur.
     *
     * @param {string} description
     * @returns {EmbedBuilder}
     */
    static error(description) {
        return new EmbedBuilder()
            .setColor(0xFF4444)
            .setDescription(description);
    }
}

module.exports = EmbedHelper;
