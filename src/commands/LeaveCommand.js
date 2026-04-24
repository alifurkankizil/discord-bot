const BaseCommand = require('./BaseCommand');

class LeaveCommand extends BaseCommand {
    /**
     * @param {import('../services/ConnectionService')} connectionService
     * @param {import('../services/PlayerService')}    playerService
     */
    constructor(connectionService, playerService) {
        super({
            name: 'leave',
            aliases: ['dc'],
            description: 'Botu ses kanalından çıkarır.',
        });
        this._connection = connectionService;
        this._player     = playerService;
    }

    async execute(message) {
        const guildId = message.guild.id;
        const disconnected = this._connection.disconnect(guildId);

        if (!disconnected) {
            return message.reply('❌ Zaten bir ses kanalında değilim.');
        }

        this._player.remove(guildId);
        message.reply('👋 Görüşürüz!');
    }
}

module.exports = LeaveCommand;
