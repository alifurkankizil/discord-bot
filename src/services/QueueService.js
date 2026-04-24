/**
 * QueueService — Guild başına şarkı kuyruğu yönetimi.
 *
 * Her guild için bağımsız bir kuyruk ve metin kanalı referansı tutar.
 * Şarkı metadata'sı burada saklanır; stream URL'si çalma anında taze çekilir.
 *
 * @typedef {{ title: string, url: string, duration: string, thumbnail: string|null, requester: string }} Song
 */
class QueueService {
    constructor() {
        /** @type {Map<string, Song[]>} */
        this._queues = new Map();

        /** @type {Map<string, import('discord.js').TextChannel>} */
        this._channels = new Map();
    }

    /**
     * Kuyruğun sonuna şarkı ekle.
     *
     * @param {string} guildId
     * @param {Song} song
     * @param {import('discord.js').TextChannel} channel
     */
    enqueue(guildId, song, channel) {
        if (!this._queues.has(guildId)) {
            this._queues.set(guildId, []);
        }
        this._queues.get(guildId).push(song);
        this._channels.set(guildId, channel);
    }

    /**
     * Kuyruğun başındaki şarkıyı al ve kuyruktan çıkar.
     *
     * @param {string} guildId
     * @returns {Song | null}
     */
    dequeue(guildId) {
        const queue = this._queues.get(guildId);
        if (!queue || queue.length === 0) return null;
        return queue.shift();
    }

    /**
     * Kuyruktaki tüm şarkıların kopyasını döndür (kuyruk değişmez).
     *
     * @param {string} guildId
     * @returns {Song[]}
     */
    getAll(guildId) {
        return [...(this._queues.get(guildId) ?? [])];
    }

    /**
     * Kuyruk kaç şarkı içeriyor?
     *
     * @param {string} guildId
     * @returns {number}
     */
    size(guildId) {
        return this._queues.get(guildId)?.length ?? 0;
    }

    /**
     * Kuyruk boş mu?
     *
     * @param {string} guildId
     * @returns {boolean}
     */
    isEmpty(guildId) {
        const q = this._queues.get(guildId);
        return !q || q.length === 0;
    }

    /**
     * Guild'in metin kanalını güncelle.
     *
     * @param {string} guildId
     * @param {import('discord.js').TextChannel} channel
     */
    setChannel(guildId, channel) {
        this._channels.set(guildId, channel);
    }

    /**
     * Guild'in kayıtlı metin kanalını döndür.
     *
     * @param {string} guildId
     * @returns {import('discord.js').TextChannel | null}
     */
    getChannel(guildId) {
        return this._channels.get(guildId) ?? null;
    }

    /**
     * Kuyruğu temizle (kanal referansını koru).
     *
     * @param {string} guildId
     */
    clear(guildId) {
        this._queues.set(guildId, []);
    }

    /**
     * Guild'e ait tüm veriyi sil (bot kanaldan çıktığında).
     *
     * @param {string} guildId
     */
    remove(guildId) {
        this._queues.delete(guildId);
        this._channels.delete(guildId);
    }
}

module.exports = QueueService;
