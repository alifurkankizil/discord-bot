const BaseCommand = require('./BaseCommand');

class StopCommand extends BaseCommand {
    /**
     * @param {import('../services/PlayerService')} playerService
     */
    constructor(playerService) {
        super({
            name: 'stop',
            aliases: [],
            description: 'Çalmayı durdurur.',
        });
        this._player = playerService;
    }

    async execute(message) {
        const stopped = this._player.stop(message.guild.id);
        message.reply(stopped ? '⏹️ Durduruldu.' : '❌ Şu an çalan bir şey yok.');
    }
}

module.exports = StopCommand;
