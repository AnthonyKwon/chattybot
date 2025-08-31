const { Client, Events, GatewayIntentBits } = require('discord.js');
const { ConversationManager } = require('./modules/conversation/Conversation');
const slash = require('./modules/discord_legacy/slashCommand.js');
const thread = require('./modules/discord_legacy/thread.js');
const config = require('./modules/config.js');
const logger = require('./modules/logger/main.mod.js');
const appInfo = require('../package.json');

// initialize logger module for main
logger.info({ topic: appInfo.name, message: `version ${appInfo.version}` });


// create discord_legacy.js client object
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once(Events.ClientReady, async c => {
    // create voice session map
    logger.info({ topic: 'discord_legacy.js', message: `Connected to ${client.user.username}!` });

    // check if user launched bot to register/unregister commands
    if (process.env.SLASH_ACTION === 'register')
        slash.register(config.token, c);
    else if (process.env.SLASH_ACTION == 'unregister')
        slash.unregister(config.token, c);

    // set bot activity message if available
    if (config.status && config.status !== '') c.user.setActivity(config.status);

    // load registered slash commands
    slash.load(c);
});

client.on(Events.InteractionCreate, interaction => {
    // filter only for chat interaction
    if (!interaction.isChatInputCommand()) return;
    // call slash command handler
    slash.handler(interaction);
});

// Reply to a user who mentions the bot
client.on(Events.MessageCreate, async message => {
    // ignore message sent from bot
    if (message.author.bot) return;

    // get conversation from current guild
    const conversation = ConversationManager.get(message.guildId);

    // ignore the non-conversation message
    if (!!!conversation) return;

    await conversation.onMessage(message);
});

client.on(Events.ThreadDelete, t => {
    // check if thread owner is same as bot user
    if (t.ownerId !== t.client.user.id) return;

    // handle thread deletion by other factor 
    thread.onDelete(t);
});

client.on(Events.ThreadUpdate, (oldThread, newThread) => {
    // handle thread update by other factor
    if (!oldThread.archived && newThread.archived) thread.onArchive(newThread);
});

// log unhandled error of discord_legacy.js
client.on(Events.Error, err => {
    logger.error({ topic: 'discord_legacy.js', message: 'Unhandled error has occured!' });
    logger.error({ topic: 'discord_legacy.js', message: err.stack });
});

// exit with error on unhandled Rejection
process.on('unhandledRejection', err => {
    logger.error({ topic: appInfo.name, message: 'An unhandled Rejection has occured, appliation will exit!' });
    logger.error({ topic: appInfo.name, message: err.stack });
    process.exit(1);
});

// exit with error on uncaught Exception
process.on('uncaughtException', err => {
    logger.error({ topic: appInfo.name, message: 'An uncaught Exception has thrown, appliation will exit!' });
    logger.error({ topic: appInfo.name, message: err.stack });
    process.exit(1);
});

// destroy discord_legacy.js connection on exit
function exitHandler() {
    client.destroy().finally(() => process.exit(0));
}
process.on('SIGINT', exitHandler);
process.on('SIGTERM', exitHandler);

// initialize discord_legacy module
client.login(config.token);
