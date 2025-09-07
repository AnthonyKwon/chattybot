const { Client, Events, GatewayIntentBits } = require('discord.js');
const { ConversationManager } = require('./modules/conversation/Conversation');
const command = require('./modules/discord/command/Command');
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
    logger.info({ topic: 'discord', message: `Connected to ${client.user.username}!` });

    // set bot activity message if available
    if (config.status && config.status !== '') c.user.setActivity(config.status);

    // load registered slash commands
    await command.load();
});

client.on(Events.InteractionCreate, interaction => {
    // filter only for chat interaction
    if (!interaction.isChatInputCommand()) return;

    // call slash command handler
    command.handle(interaction);
});

// Reply to a user who mentions the bot
client.on(Events.MessageCreate, message => {
    // ignore message sent from bot
    if (message.author.bot) return;

    // ignore the message not from guild
    if (!message.guild || !message.guildId) return;

    // get conversation from current guild
    const conversation = ConversationManager.get(message.guildId);

    // ignore the non-conversation message
    if (!conversation ||
        !conversation.verify(message.guildId, message.channelId)) return;

    // emit conversation message received event
    conversation.emit(`message-${message.guildId}`, message);
});

client.on(Events.ThreadDelete, thread => {
    // check if thread owner is same as bot user
    if (thread.ownerId !== thread.client.user.id) return;

    // get conversation from current guild
    const conversation = ConversationManager.get(thread.guildId);

    // ignore the event not related to conversation
    if (!conversation ||
        !conversation.verify(thread.guildId, thread.id)) return;

    // emit conversation thread deleted event
    conversation.emit(`threadObsolete-${thread.guildId}`);
});

client.on(Events.ThreadUpdate, (oldThread, newThread) => {
    // check if event is triggered by thread archive
    if (!oldThread.archived && newThread.archived) {
        // get conversation from current guild
        const conversation = ConversationManager.get(newThread.guildId);

        // ignore the event not related to conversation
        if (!conversation) return;

        // emit conversation thread deleted event
        conversation.emit(`threadObsolete-${newThread.guildId}`);
    }
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
//require('./modules/discord/command/CommandRegister').register();
