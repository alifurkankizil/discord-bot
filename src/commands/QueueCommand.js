const BaseCommand = require('./BaseCommand');
const EmbedHelper = require('../utils/EmbedHelper');

class QueueCommand extends BaseCommand {
    /**
     * @param {import('../services/QueueService')} queueService
     */
    constructor(queueService) {
        super({
            name: 'queue',
            aliases: ['q'],
            description: 'Şarkı kuyruğunu listeler.',
        });
        this._queue = queueService;
    }

    async execute(message) {
        const guildId = message.guild.id;
        const songs   = this._queue.getAll(guildId);

        const embed = EmbedHelper.showQueue(songs);
        message.channel.send({ embeds: [embed] });
    }
}

module.exports = QueueCommand;
