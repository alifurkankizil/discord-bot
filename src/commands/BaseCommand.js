/**
 * BaseCommand — Tüm komutların türediği soyut temel sınıf.
 * Her komut bu sınıfı extend edip execute() metodunu implement etmek zorundadır.
 */
class BaseCommand {
    /**
     * @param {object} options
     * @param {string}   options.name        - Ana komut adı (örn. 'play')
     * @param {string[]} options.aliases     - Alternatif isimler (örn. ['p'])
     * @param {string}   options.description - Kısa açıklama
     */
    constructor({ name, aliases = [], description = '' }) {
        if (new.target === BaseCommand) {
            throw new Error('BaseCommand doğrudan örneklenemez.');
        }
        this.name = name;
        this.aliases = aliases;
        this.description = description;
    }

    /**
     * Komut çalıştırma — alt sınıflar override etmek zorunda.
     * @param {import('discord.js').Message} message
     * @param {string[]} args
     * @returns {Promise<void>}
     */
    async execute(message, args) {
        throw new Error(`${this.name} komutu execute() metodunu implement etmedi.`);
    }
}

module.exports = BaseCommand;
