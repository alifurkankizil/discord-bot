const BaseCommand = require('./BaseCommand');

class JoinCommand extends BaseCommand {
    /**
     * @param {import('../services/ConnectionService')} connectionService
     */
    constructor(connectionService) {
        super({
            name: 'join',
            aliases: [],
            description: 'Botu ses kanalına davet eder.',
        });
        this._connection = connectionService;
    }

    async execute(message) {
        if (!message.member?.voice?.channel) {
            return message.reply('❌ Önce bir ses kanalına katılman gerekiyor!');
        }

        try {
            const voiceChannel = message.member.voice.channel;
            await this._connection.connect(message);
            message.reply(`✅ **${voiceChannel.name}** kanalına bağlandım!`);
        } catch (err) {
            message.reply(err.message);
        }
    }
}

module.exports = JoinCommand;
