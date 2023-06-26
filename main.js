const { Client, Events, GatewayIntentBits } = require('discord.js');
const slash = require('./modules/discordutils/slashCommand.js');
const config = require('./modules/config.js');
const logger = require('./modules/logger/main.mod.js');
const package = require('./package.json');

// initialize logger module for main
logger.info(package.name, `version ${package.version}`);

// create discord.js client object
const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
]});

client.once(Events.ClientReady, async c => {
    // create voice session map
    logger.info('discord.js', `Connected to ${client.user.username}!`);

    // check if user launched bot to unregister commands
    if (process.env.UNREGISTER_SLASH == 'yes') {
        // unregister slash commands
        logger.warn('discord.js', 'Unregistering slash commands...');
        await client.application.commands.set([]);
        process.exit();
    }

    // set bot activity message
    c.user.setActivity(`${config.status} — /say`);

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

// initialize discord module
client.login(config.token);
