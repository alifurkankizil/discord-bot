/**
 * CommandRegistry — Strateji deseni uygulayıcısı.
 * Komut nesnelerini isim/alias'a göre kaydeder ve çözümler.
 */
class CommandRegistry {
    constructor() {
        /** @type {Map<string, import('./BaseCommand')>} */
        this._commands = new Map();
    }

    /**
     * Bir komut stratejisini kaydet.
     * @param {import('./BaseCommand')} commandInstance
     */
    register(commandInstance) {
        this._commands.set(commandInstance.name, commandInstance);
        for (const alias of commandInstance.aliases) {
            this._commands.set(alias, commandInstance);
        }
    }

    /**
     * İsim veya alias ile komut nesnesini döndür.
     * @param {string} name
     * @returns {import('./BaseCommand') | undefined}
     */
    resolve(name) {
        return this._commands.get(name.toLowerCase());
    }

    /**
     * Kayıtlı tüm (benzersiz) komutları döndür.
     * @returns {import('./BaseCommand')[]}
     */
    all() {
        return [...new Set(this._commands.values())];
    }
}

module.exports = CommandRegistry;
