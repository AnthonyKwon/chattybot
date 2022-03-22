const { Client, Intents } = require('discord.js');
const config = require('../config.js');
const logger = require('../logger.js');
const onCommand = require('./command');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES] });

client.once('ready', () => {
    // create voice session map
    client.voice.session = new Map(); 
    logger.log('verbose', `[discord.js] Connected to ${client.user.username}!`);
});

client.on('messageCreate', async message => {
    await onCommand(message);
});

async function init() {
    await client.login(config.token);
}

module.exports = init;
