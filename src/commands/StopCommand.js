const BaseCommand = require('./BaseCommand');

class StopCommand extends BaseCommand {
    /**
     * @param {import('../services/PlayerService')} playerService
     * @param {import('../services/QueueService')}  queueService
     */
    constructor(playerService, queueService) {
        super({
            name: 'stop',
            aliases: [],
            description: 'Çalmayı durdurur ve kuyruğu temizler.',
        });
        this._player = playerService;
        this._queue  = queueService;
    }

    async execute(message) {
        const guildId = message.guild.id;
        const stopped = this._player.stop(guildId);

        if (!stopped) {
            return message.reply('❌ Şu an çalan bir şey yok.');
        }

        // Kuyruğu temizle (idle callback'in tetiklememesi için önce sıfırla)
        this._queue.clear(guildId);
        message.reply('⏹️ Durduruldu ve kuyruk temizlendi.');
    }
}

module.exports = StopCommand;
