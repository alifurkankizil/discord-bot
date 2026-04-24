const {
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus,
    StreamType,
} = require('@discordjs/voice');

/**
 * PlayerService — Guild bazlı AudioPlayer yaşam döngüsü yönetimi.
 * Her guild için tek bir player örneği tutar (Map).
 */
class PlayerService {
    constructor() {
        /** @type {Map<string, import('@discordjs/voice').AudioPlayer>} */
        this._players = new Map();
    }

    /**
     * Guild'in player'ını döndür; yoksa yeni oluştur.
     *
     * @param {string} guildId
     * @param {import('discord.js').TextChannel} [channel] - Hata mesajları için
     * @returns {import('@discordjs/voice').AudioPlayer}
     */
    getOrCreate(guildId, channel) {
        if (this._players.has(guildId)) {
            return this._players.get(guildId);
        }

        const player = createAudioPlayer();
        this._players.set(guildId, player);

        player.on(AudioPlayerStatus.Idle, () => {
            console.log(`[PlayerService] Guild ${guildId} — çalma bitti.`);
        });

        player.on('error', (error) => {
            console.error(`[PlayerService] Guild ${guildId} — hata:`, error.message);
            channel?.send(`❌ Çalma hatası: ${error.message}`);
        });

        return player;
    }

    /**
     * Verilen stream URL'sini çal ve connection'a bağla.
     *
     * @param {string} guildId
     * @param {string} streamUrl
     * @param {import('@discordjs/voice').VoiceConnection} connection
     * @param {import('discord.js').TextChannel} channel
     */
    play(guildId, streamUrl, connection, channel) {
        const player = this.getOrCreate(guildId, channel);

        const resource = createAudioResource(streamUrl, {
            inputType: StreamType.Arbitrary,
        });

        player.play(resource);
        connection.subscribe(player);
    }

    /**
     * Çalmayı durdur (player'ı Idle'a al).
     * @param {string} guildId
     * @returns {boolean}
     */
    stop(guildId) {
        const player = this._players.get(guildId);
        if (!player) return false;
        player.stop();
        return true;
    }

    /**
     * Çalmayı duraklat.
     * @param {string} guildId
     * @returns {boolean}
     */
    pause(guildId) {
        const player = this._players.get(guildId);
        if (!player) return false;
        player.pause();
        return true;
    }

    /**
     * Duraklatılmış çalmayı devam ettir.
     * @param {string} guildId
     * @returns {boolean}
     */
    resume(guildId) {
        const player = this._players.get(guildId);
        if (!player) return false;
        player.unpause();
        return true;
    }

    /**
     * Player'ı sil (bot kanaldan ayrıldığında).
     * @param {string} guildId
     */
    remove(guildId) {
        this._players.delete(guildId);
    }

    /**
     * Guild'in player'ı var mı?
     * @param {string} guildId
     * @returns {boolean}
     */
    has(guildId) {
        return this._players.has(guildId);
    }
}

module.exports = PlayerService;
