const { Client, Events, GatewayIntentBits } = require('discord.js');
const slash = require('./slashCommand.js');
const config = require('../config.js');
const logger = require('../logger/main.mod.js');

const client = new Client({ intents: [
    GatewayIntentBits.Guilds
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
