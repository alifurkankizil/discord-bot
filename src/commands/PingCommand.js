const BaseCommand = require('./BaseCommand');

class PingCommand extends BaseCommand {
    /**
     * @param {import('discord.js').Client} client
     */
    constructor(client) {
        super({
            name: 'ping',
            aliases: [],
            description: 'Bot gecikmesini gösterir.',
        });
        this._client = client;
    }

    async execute(message) {
        message.reply(`🏓 Pong! Gecikme: **${this._client.ws.ping}ms**`);
    }
}

module.exports = PingCommand;
