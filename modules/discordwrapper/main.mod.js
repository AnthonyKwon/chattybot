const path = require('node:path');
const { Client, Events, GatewayIntentBits } = require('discord.js');
const slash = require('./slashCommand.js');
const config = require('../config.js');
const logger = require(path.join(path.dirname(require.main.filename), 'modules', 'logger', 'main.mod.js'));
const i18n = require('../i18n/main.mod.js');

const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
]});

client.once(Events.ClientReady, c => {
    // create voice session map
    logger.info('discord.js', `Connected to ${client.user.username}!`);
    c.voice.session = new Map();
    c.user.setActivity(' — /help');

    // register slash commands
    logger.info('discord.js', 'Reloading slash commands...');
    slash.register(config.token, c);

    // load registered slash commands
    slash.load(c);

    //
    c.guilds.cache.forEach(guild => {
        guild.i18n = new i18n.GuildI18n(guild.id);
    });
});

client.on(Events.InteractionCreate, interaction => {
    if (!interaction.isChatInputCommand()) return; // filter only for chat interaction
    slash.handler(interaction);
});

async function init() {
    await client.login(config.token);
}

module.exports = { 
    init
};
