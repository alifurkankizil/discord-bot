const BaseCommand = require('./BaseCommand');

class PauseCommand extends BaseCommand {
    /**
     * @param {import('../services/PlayerService')} playerService
     */
    constructor(playerService) {
        super({
            name: 'pause',
            aliases: [],
            description: 'Çalmayı duraklatır.',
        });
        this._player = playerService;
    }

    async execute(message) {
        const paused = this._player.pause(message.guild.id);
        message.reply(paused ? '⏸️ Duraklatıldı.' : '❌ Şu an çalan bir şey yok.');
    }
}

module.exports = PauseCommand;
