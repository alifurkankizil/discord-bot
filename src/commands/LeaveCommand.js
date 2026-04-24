const BaseCommand = require('./BaseCommand');

class LeaveCommand extends BaseCommand {
    /**
     * @param {import('../services/ConnectionService')} connectionService
     * @param {import('../services/PlayerService')}    playerService
     * @param {import('../services/QueueService')}     queueService
     */
    constructor(connectionService, playerService, queueService) {
        super({
            name: 'leave',
            aliases: ['dc'],
            description: 'Botu ses kanalından çıkarır ve kuyruğu temizler.',
        });
        this._connection = connectionService;
        this._player     = playerService;
        this._queue      = queueService;
    }

    async execute(message) {
        const guildId      = message.guild.id;
        const disconnected = this._connection.disconnect(guildId);

        if (!disconnected) {
            return message.reply('❌ Zaten bir ses kanalında değilim.');
        }

        this._player.remove(guildId);
        this._queue.remove(guildId);
        message.reply('👋 Görüşürüz!');
    }
}

module.exports = LeaveCommand;
