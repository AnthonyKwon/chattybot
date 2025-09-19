import { Client, Events, GatewayIntentBits } from 'discord.js';
import { ConversationManager } from './modules/conversation/Conversation';
import * as command from './modules/discord/command/Command';
import config from './modules/config/ConfigLoader';
import logger from './modules/log/Logger';
import { name as appName, version } from '../package.json';

// initialize logger module for main
logger.info({ topic: appName, message: `version ${version}` });

// create discord client object
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
    logger.info({ topic: 'discord', message: `Connected to ${client.user?.username ?? 'Discord user'}!` });

    // set bot activity message if available
    if (config.discord.status) c.user.setActivity(config.discord.status);

    // load registered slash commands
    await command.load();
});

client.on(Events.InteractionCreate, interaction => {
    // filter only for chat interaction
    if (!interaction.isChatInputCommand()) return;

    // call slash command handler
    command.handle(interaction);
});

client.on(Events.MessageCreate, message => {
    // ignore message sent from bot
    if (message.author.bot) return;

    // ignore the message not from guild
    if (!message.guild || !message.guildId) return;

    // get conversation from current guild
    const conversation = ConversationManager.get(message.guildId);

    // ignore the non-conversation message
    if (!conversation || conversation.destroyed ||
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
    if (!conversation || conversation.destroyed ||
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
        if (!conversation || conversation.destroyed ||
            !conversation.verify(newThread.guildId, newThread.id)) return;

        // emit conversation thread deleted event
        conversation.emit(`threadObsolete-${newThread.guildId}`);
    }
});

client.on(Events.VoiceStateUpdate, (oldState, newState) => {
    // check if disconnected user is this bot
    if (oldState.member?.id !== oldState.client.user.id) return;

    // ignore when event is not fired by disconnection
    if (!oldState.channel || newState.channel) return;

    // get conversation from current guild
    const conversation = ConversationManager.get(oldState.guild.id);

    // ignore the event not related to conversation
    if (!conversation || conversation.destroyed) return;

    // emit conversation thread deleted event
    conversation.emit(`voiceDisconnect-${oldState.guild.id}`);
})

// log unhandled error of discord.js
client.on(Events.Error, err => {
    logger.error({ topic: 'discord', message: 'Unhandled error has occurred!' });
    logger.error({ topic: 'discord', message: err.stack });
});

// exit with error on unhandled Rejection
process.on('unhandledRejection', async (err: Error) => {
    logger.error({ topic: appName, message: 'An unhandled Rejection has occurred, application will exit!' });
    logger.error({ topic: appName, message: err.stack });
    // give it some time to write log properly
    await new Promise(resolve => setTimeout(resolve, 500));
    process.exit(1);
});

// exit with error on uncaught Exception
process.on('uncaughtException', async (err: Error) => {
    logger.error({ topic: appName, message: 'An uncaught Exception has thrown, application will exit!' });
    logger.error({ topic: appName, message: err.stack });
    // give it some time to write log properly
    await new Promise(resolve => setTimeout(resolve, 500));
    process.exit(1);
});

// destroy discord.js connection on exit
function exitHandler() {
    client.destroy().finally(() => process.exit(0));
}
process.on('SIGINT', exitHandler);
process.on('SIGTERM', exitHandler);

// initialize discord module
client.login(config.discord.token);