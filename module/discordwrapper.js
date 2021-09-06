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
const voiceMap = new Map();

// On bot ready (initialized and connected)
client.once('ready', () => {
    logger.log('verbose', `[discord.js] Connected to ${client.user.username}!`);
    client.user.setActivity(statusMsg, "PLAYING");
});

client.on('message', (message) => {
    // Ignore message sent from DM or bot
    if (message.channel.type === 'dm' || message.author.bot) return;

    // Parse command from message
    commandParse(message);
});

client.on('voiceStateUpdate', (oldState, newState) => {
    const message = oldState.member.lastMessage;
    const voice = voiceMap.get(oldState.guild.id);
    /* Auto-pause music player when everyone leaves voice channel */
    if (!voice || !voice.Player || !voice.Player.playState) return;
    if (oldState.channel && oldState.channel.members.size < 2) {
        voice.Player.toggleState(voice);
        logger.log('verbose', `[discord.js] All users left channel, player auto-paused.`);
        if (message) message.channel.send(localize.get('message.music.auto_paused', voice.channel.name));
    }
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

// voiceConnection wrapper class
class VoiceClass {
    constructor(guildId) {
        this._connection = undefined;
        this._channel = {
            id: 0,
            name: undefined
        }
        this._guildId = guildId;
        this._player = new Map();
        this._tts = new Map();
        this._volume = 100;
    }

    get channel() {
        return this._channel;
    }

    /* return connection dispatcher if available */
    get dispatcher() {
        if (this._connection.status !== 0) return undefined;
        return this._connection.dispatcher;
    }

    /* get guild ID of class */
    get guildId() {
        return this.guildId;
    }

    /* set-get Player map (to passed value) */
    set Player(value) {
        this._player.set(this._guildId, value);
    }
    get Player() {
        return this._player.get(this._guildId);
    }

    /* set-get TTS map (to passed value) */
    set TTS(value) {
        this._tts.set(this._guildId, value);
    }
    get TTS() {
        return this._tts.get(this._guildId);
    }

    /* get-set voice volume */
    get volume() {
        return this._volume;
    }
    set volume(rate) {
        if (rate <= 200 && rate >= 0) {
            this._volume = rate;
            if (this._connection.dispatcher)
                this._connection.dispatcher.setVolume(this._volume / 100);
        }
    }

    /* join discord voice connection */
    async join(channel) {
        this._connection = await channel.join();
        /* Set speaking status to none */
        this._connection.setSpeaking(0);
        /* set channel info */
        this._channel.id = this._connection.channel.id;
        this._channel.name = this._connection.channel.name;
        return true;
    }

    play(stream, option=undefined) {
        /* Join voice channel first if not */
        if (!this._connection || this._connection.status !== 0) {
            return false;
        }
        const output = this._connection.play(stream, option);
        this._connection.dispatcher.setVolume(this._volume / 100);
        return output;
    }

    /* leave discord voice connection */
    async leave() {
        if (this._connection.status !== 0) return;
        this._connection.disconnect();
        return true;
    }
}

module.exports = {
    voiceMap,
    init: initialize,
    sendWebhook,
    MessageAttachment: Discord.MessageAttachment,
    Voice: VoiceClass
}
