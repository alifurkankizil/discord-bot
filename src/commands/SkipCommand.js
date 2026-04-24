const BaseCommand = require('./BaseCommand');

class SkipCommand extends BaseCommand {
    /**
     * @param {import('../services/PlayerService')} playerService
     * @param {import('../services/QueueService')}  queueService
     */
    constructor(playerService, queueService) {
        super({
            name: 'skip',
            aliases: ['s'],
            description: 'Mevcut şarkıyı atlar, kuyrukta şarkı varsa devam eder.',
        });
        this._player = playerService;
        this._queue  = queueService;
    }

    async execute(message) {
        const guildId = message.guild.id;

        if (!this._player.isPlaying(guildId)) {
            return message.reply('❌ Şu an çalan bir şarkı yok.');
        }

        const remaining = this._queue.size(guildId);

        // stop() → Idle event → idle callback → kuyruktaki sonraki şarkıyı çalar
        this._player.stop(guildId);

        if (remaining > 0) {
            message.reply(`⏭️ Atlandı! Kuyrukta **${remaining}** şarkı kaldı.`);
        } else {
            message.reply('⏭️ Atlandı! Kuyruk boş, çalma bitti.');
        }
    }
}

module.exports = SkipCommand;
