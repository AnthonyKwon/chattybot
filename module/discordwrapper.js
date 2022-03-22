const fs = require('fs');
const path = require('path');

const common = require('../module/common.js');
const config = require('./config.js');
const logger = require('./logger.js');
const localize = require('./localization.js');
const helpCmd = require('./commands/basic_help.js');

// Discord client
const Discord = require('discord.js');
const client = new Discord.Client();
client.commands = new Discord.Collection();

// command files
const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));

// bot status message
let statusMsg = '';

const cooldown = new Map();
const webhookMap = new Map();

// On bot ready (initialized and connected)
client.once('ready', () => {
    client.voice.session = new Map(); // add voice session map
    logger.log('verbose', `[discord.js] Connected to ${client.user.username}!`);
    //client.user.setActivity(statusMsg, "PLAYING");
});

client.on('message', (message) => {
    // Ignore message sent from DM or bot
    if (message.channel.type === 'dm' || message.author.bot) return;

    // Parse command from message
    commandParse(message);
});

// Parse command from message
async function commandParse(message) {
    // Ignore message without command prefix
    if (!message.content.startsWith(config.prefix)) return false;

    // Get command and argument from message
    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = message.client.commands.get(commandName)
        || message.client.commands.find(cmd => localize.commandCheck(commandName, cmd.name))
        || message.client.commands.find(cmd => common.parseAliases(commandName, cmd.aliases));

    // Show unknown command message and return
    if (commandName && !command) {
        message.channel.send(localize.get('error.discord.unknown_command'));
        return false;
    } else if (!commandName) {
        return false;
    }

     // Check argument exists (if required)
     if (command.argsRequired && !args.length) {
        message.channel.send(localize.get('error.discord.args_missing'));

        helpCmd.execute(message, [command.name]);
        logger.log('error', `[discord.js] ${message.author} tried to use command, but no argument provided!`);
        return false;
    }

    // cooldown mechamism
    if (command.cooldown) {
        /* If user is on cooldown, cancel command run */
        const currentCooldown = cooldown.get(`${message.author.id}:${command.name}`);
        if (currentCooldown && currentCooldown > Date.now()) {
            const timeLeft = Math.round((currentCooldown - Date.now()) / 1000);
            message.channel.send(localize.get('error.discord.ongoing_cooldown', timeLeft));
            logger.log('error', `[discord.js] ${message.author} tried to use command, but cooldown was not passed! (${timeLeft}s)`);
            return false;
        }

        /* Register user on cooldown timer */
        cooldown.set(`${message.author.id}:${command.name}`, Date.now() + (command.cooldown * 1000));
        setTimeout(() => cooldown.delete(`${message.author.id}:${command.name}`), command.cooldown * 1000);
    }

    /* try to run specified command */
    try {
        await command.execute(message, args);
    } catch (err) {
        const errorReport = new Discord.MessageAttachment(Buffer.from(err.stack), `report-${common.datetime()}.txt`);
        logger.log('error', `[discord.js] Failed to launch requested command!\n  ${err}`);
        message.channel.send(localize.get('error.generic'), errorReport);
    }
}

// create or get webhook from sender's guild
async function createWebhook(message) {
    // If webhook exists in map, return it
    if (webhookMap.has(message.channel.id)) return webhookMap.get(message.channel.id);

    try {
        // Check if webhook exists and return it
        const channelWebhooks = await message.channel.fetchWebhooks();
        if (channelWebhooks.size > 0) return channelWebhooks.first();

        // If not, create webhooks and return it
        const webhook = await message.channel.createWebhook('Chatty-Webhook');
        logger.log('verbose', `[discord.js] Created webhook "${webhook}".`);
        webhookMap.set(message.channel.id, webhook);
        return webhook;
    } catch (err) {
        logger.log('error', `[discord.js] Failed to create webhook.\n  ${err.stack}`);
        return undefined;
    }
}

async function sendWebhook(message, text) {
    // Retrieve webhook
    const webhook = await createWebhook(message);
    if (!webhook) {
        // Fallback to old method
        message.channel.send(localize.get('format.tts.message', undefined, message.author, text));
        return;
    }

    // send webhook message
    try {
        const guildUsername = message.guild.members.cache.get(message.author.id).nickname ?
            message.guild.members.cache.get(message.author.id).nickname : message.author.username;
        await webhook.send(text, {
            username: guildUsername,
            avatarURL: message.author.avatarURL()
        });
    } catch (err) {
        logger.log('error', `[discord.js] Failed to send webhook.\n  ${err.stack}`);
        // Fallback to old method
        message.channel.send(localize.get('format.tts.message', undefined, message.author, text));
    }
}

// Initialize Discord.js wrapper
function initialize(devFlag) {
    statusMsg = devFlag ? "🔧 점검 중 🔧" : config.status;

    // Dyanic command handler
    for (const file of commandFiles) {
        const command = require(path.join(__dirname, 'commands', file));
        client.commands.set(command.name, command);
    }

    // Authenticate to discord
    client.login(config.token);
}

module.exports = {
    init: initialize,
    sendWebhook,
    MessageAttachment: Discord.MessageAttachment,
}
