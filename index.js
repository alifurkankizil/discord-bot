require('dotenv').config();

const { Client, GatewayIntentBits, Events } = require('discord.js');

// Services
const ConnectionService = require('./src/services/ConnectionService');
const PlayerService     = require('./src/services/PlayerService');
const YouTubeService    = require('./src/services/YouTubeService');
const QueueService      = require('./src/services/QueueService');

// Commands
const CommandRegistry = require('./src/commands/CommandRegistry');
const JoinCommand     = require('./src/commands/JoinCommand');
const PlayCommand     = require('./src/commands/PlayCommand');
const StopCommand     = require('./src/commands/StopCommand');
const PauseCommand    = require('./src/commands/PauseCommand');
const ResumeCommand   = require('./src/commands/ResumeCommand');
const LeaveCommand    = require('./src/commands/LeaveCommand');
const PingCommand     = require('./src/commands/PingCommand');
const SkipCommand     = require('./src/commands/SkipCommand');
const QueueCommand    = require('./src/commands/QueueCommand');

const TOKEN  = process.env.DISCORD_TOKEN;
const PREFIX = process.env.PREFIX || '!';

if (!TOKEN) {
    console.error('HATA: DISCORD_TOKEN .env dosyasinda bulunamadi!');
    process.exit(1);
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
    ],
});

const connectionService = new ConnectionService();
const playerService     = new PlayerService();
const youTubeService    = new YouTubeService();
const queueService      = new QueueService();

const registry = new CommandRegistry();

registry.register(new JoinCommand(connectionService));
registry.register(new PlayCommand(connectionService, playerService, youTubeService, queueService, client));
registry.register(new StopCommand(playerService, queueService));
registry.register(new PauseCommand(playerService));
registry.register(new ResumeCommand(playerService));
registry.register(new LeaveCommand(connectionService, playerService, queueService));
registry.register(new PingCommand(client));
registry.register(new SkipCommand(playerService, queueService));
registry.register(new QueueCommand(queueService));

client.once(Events.ClientReady, () => {
    console.log(client.user.tag + ' hazir! (' + registry.all().length + ' komut yuklendi)');
});

client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot || !message.content.startsWith(PREFIX)) return;

    const args    = message.content.slice(PREFIX.length).trim().split(/ +/);
    const cmdName = args.shift().toLowerCase();

    const command = registry.resolve(cmdName);
    if (!command) return;

    try {
        await command.execute(message, args);
    } catch (err) {
        console.error('[index] Komut hatasi (' + cmdName + '):', err);
        message.reply('Beklenmedik bir hata olustu: ' + err.message).catch(() => {});
    }
});

client.login(TOKEN);
