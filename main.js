const { Client, Events, GatewayIntentBits, Locale, REST, Routes } = require('discord.js');
const slash = require('./modules/discordutils/slashCommand.js');
const thread = require('./modules/discordutils/thread.js');
const config = require('./modules/config.js');
const logger = require('./modules/logger/main.mod.js');
const package = require('./package.json');

// initialize logger module for main
logger.info(package.name, `version ${package.version}`);

// create discord.js client object
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
    logger.info('discord.js', `Connected to ${client.user.username}!`);

    // check if user launched bot to unregister commands
    if (process.env.UNREGISTER_SLASH == 'yes') {
        const rest = new REST().setToken(config.token);
        try {
            logger.info('discord.js', 'Unregistering slash commands...');

            // unregister guild slash commands
            c.guilds.cache.forEach(async guild => await rest.put(Routes.applicationCommands(c.user.id, guild.id), { body: [] }));

            // unregister global slash commands
            await rest.put(Routes.applicationCommands(c.user.id), { body: [] });

            logger.info('discord.js', 'Unregistered all slash commands.');
        } catch (err) {
            logger.error('discord.js', 'Failed to unregister slash command!');
            logger.error('discord.js', err.stack ? err.stack : err);
        }
        process.exit();
    }

    // set bot activity message if available
    if (config.status && config.status !== '') c.user.setActivity(`${config.status}`);

    // register slash commands
    //TODO: cache command data and register only when updated
    logger.info('discord.js', 'Reloading slash commands...');
    slash.register(config.token, c);

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
client.on(Events.MessageCreate, message => {
    // ignore message from a bot
    if (message.author.bot) return;
    // ignore message not from a thread
    if (!message.channel.isThread()) return;
    thread.parse(message);
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

// initialize discord module
client.login(config.token);
