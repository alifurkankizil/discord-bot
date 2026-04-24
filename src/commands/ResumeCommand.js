const BaseCommand = require('./BaseCommand');

class ResumeCommand extends BaseCommand {
    /**
     * @param {import('../services/PlayerService')} playerService
     */
    constructor(playerService) {
        super({
            name: 'resume',
            aliases: [],
            description: 'Duraklatılmış çalmayı devam ettirir.',
        });
        this._player = playerService;
    }

    async execute(message) {
        const resumed = this._player.resume(message.guild.id);
        message.reply(resumed ? '▶️ Devam ediyor.' : '❌ Şu an duraklatılmış bir şey yok.');
    }
}

module.exports = ResumeCommand;
