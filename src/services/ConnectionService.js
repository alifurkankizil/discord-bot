const {
    joinVoiceChannel,
    getVoiceConnection,
    VoiceConnectionStatus,
    entersState,
} = require('@discordjs/voice');

/**
 * ConnectionService — Guild bazlı ses bağlantısı yönetimi.
 * joinVoiceChannel / getVoiceConnection mantığını tek yerde toplar.
 */
class ConnectionService {
    /** Bağlantının hazır olması için beklenen maks. süre (ms) */
    static READY_TIMEOUT = 10_000;

    /**
     * Kullanıcının bulunduğu ses kanalına bağlan.
     * Zaten bağlı bir bağlantı varsa onu döndür.
     *
     * @param {import('discord.js').Message} message
     * @returns {Promise<import('@discordjs/voice').VoiceConnection>}
     * @throws {Error} Kullanıcı ses kanalında değilse veya bağlantı timeout olursa
     */
    async connect(message) {
        const voiceChannel = message.member?.voice?.channel;
        if (!voiceChannel) {
            throw new Error('❌ Önce bir ses kanalına katılman gerekiyor!');
        }

        // Aynı guild'de zaten bağlıysak mevcut bağlantıyı kullan
        const existing = getVoiceConnection(message.guild.id);
        if (existing) return existing;

        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator,
        });

        try {
            await entersState(connection, VoiceConnectionStatus.Ready, ConnectionService.READY_TIMEOUT);
            return connection;
        } catch (err) {
            connection.destroy();
            throw new Error(`❌ Ses kanalına bağlanılamadı: ${err.message}`);
        }
    }

    /**
     * Guild'in mevcut bağlantısını döndür (yoksa null).
     *
     * @param {string} guildId
     * @returns {import('@discordjs/voice').VoiceConnection | null}
     */
    get(guildId) {
        return getVoiceConnection(guildId) ?? null;
    }

    /**
     * Guild'in ses bağlantısını sonlandır.
     *
     * @param {string} guildId
     * @returns {boolean} Bağlantı vardı ve kapatıldı mı?
     */
    disconnect(guildId) {
        const connection = getVoiceConnection(guildId);
        if (!connection) return false;
        connection.destroy();
        return true;
    }
}

module.exports = ConnectionService;
