const Discord = require('discord.js');
const config = require('../config.js');
const logger = require('../logger.js');
const onCommand = require('./command');

const client = new Discord.Client();

client.once('ready', () => {
    // create voice session map
    client.voice.session = new Map(); 
    logger.log('verbose', `[discord.js] Connected to ${client.user.username}!`);
});

client.on('message', async message => {
    await onCommand(message);
});

async function init() {
    await client.login(config.token);
}

module.exports = init;
