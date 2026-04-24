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
            .setDescription(`**[${title}](${url})**`)
            .addFields(
                { name: '⏱️ Süre',    value: duration,    inline: true },
                { name: '👤 İsteyen', value: requester,   inline: true },
            )
            .setFooter({ text: 'teXas Bot', iconURL: botAvatarURL })
            .setTimestamp();

        if (thumbnail) embed.setThumbnail(thumbnail);
        return embed;
    }

    /**
     * "Kuyruğa Eklendi" embed'i oluştur.
     *
     * @param {object} params
     * @param {string} params.title
     * @param {string} params.url
     * @param {string} params.duration
     * @param {string} params.requester
     * @param {string|null} params.thumbnail
     * @param {number} params.position  - Kuyruktaki sıra (1'den başlar)
     * @param {string} params.botAvatarURL
     * @returns {EmbedBuilder}
     */
    static addedToQueue({ title, url, duration, requester, thumbnail, position, botAvatarURL }) {
        const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle('📋 Kuyruğa Eklendi')
            .setDescription(`**[${title}](${url})**`)
            .addFields(
                { name: '⏱️ Süre',       value: duration,           inline: true },
                { name: '👤 İsteyen',    value: requester,          inline: true },
                { name: '🔢 Sıra',       value: `#${position}`,     inline: true },
            )
            .setFooter({ text: 'teXas Bot', iconURL: botAvatarURL })
            .setTimestamp();

        if (thumbnail) embed.setThumbnail(thumbnail);
        return embed;
    }

    /**
     * Kuyruk listesi embed'i oluştur.
     *
     * @param {Array<{ title: string, url: string, duration: string, requester: string }>} songs
     * @returns {EmbedBuilder}
     */
    static showQueue(songs) {
        const embed = new EmbedBuilder()
            .setColor(0xFEE75C)
            .setTitle('📋 Şarkı Kuyruğu')
            .setTimestamp();

        if (songs.length === 0) {
            embed.setDescription('Kuyruk boş! `!play` ile şarkı ekle.');
            return embed;
        }

        // Discord embed description limiti: 4096 karakter
        const lines = songs.map((s, i) =>
            `**${i + 1}.** [${s.title}](${s.url}) \`${s.duration}\` — ${s.requester}`,
        );

        // Çok uzarsa kırp
        let description = lines.join('\n');
        if (description.length > 3900) {
            const visible = [];
            let len = 0;
            for (const line of lines) {
                if (len + line.length + 1 > 3900) break;
                visible.push(line);
                len += line.length + 1;
            }
            const hidden = songs.length - visible.length;
            description = visible.join('\n') + `\n\n*...ve ${hidden} şarkı daha*`;
        }

        embed.setDescription(description);
        embed.setFooter({ text: `Toplam ${songs.length} şarkı` });
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
