const Discord = require('discord.js');
const configManager = require('./configManager.js');
const logger = require('./logger.js');
const string = require('./stringManager.js');

const devFlag = process.env.NODE_ENV === 'development' ? true : false;
const config = configManager.read('prefix');
const cooldown = new Map();
const voiceMap = new Map();

/* parse command aliases */
function parseAliases(aliases, commandName) {
    if (typeof aliases === 'string') {
        if (aliases === commandName) return true;
    } else if (typeof aliases === 'object') {
        if (aliases.includes(commandName)) return true;
    }
    return false;
}

/* event emitted when bot is connected to discord */
function onReadyEvent(client, status) {
    logger.log('verbose', `[discord.js] Connected to ${client.user.username}!`);
    client.user.setActivity(status, "PLAYING");
}

/* event emitted when message received */
async function onMessageEvent(message) {
    /* Ignore message sent from DM */
    if (message.channel.type === 'dm') return;
    /* Dyanmic coomand handler */
    if (!message.content.startsWith(config.prefix) || message.author.bot) return;
    /* if env var is development and user is not an developer, show message and exit */
    if (devFlag && message.guild.members.cache.get(message.author.id).hasPermission('MANAGE_WEBHOOKS')) {
        logger.log('verbose',`[discord.js] ${message.author.tag} issued command: ${message.content}`);
    } else if (devFlag) {
        message.channel.send(':no_entry_sign: **앗!** 지금은 개발자분들이 시험 중이라 사용이 불가능해요.\n' +
          '다음에 더 나아진 모습으로 찾아올게요! :wink:\n' +
          ':no_entry_sign: **Oops!** I can\'t do anything as developers are currently testing me.\n' +
          'See you soon as a better look! :wink:');
        return;
    }

    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = message.client.commands.get(string.idFromString(commandName))
        || message.client.commands.find(cmd => parseAliases(cmd.aliases, string.idFromString(commandName)));
    if(!command) return;

    /* Check argument exists (if required) */
    if (command.argsRequired && !args.length) {
        let _reply = [];
        _reply.push(string.stringFromId('discord.error.argsmissing'));

        if (command.usage) {
            _reply.push(string.stringFromId('chattybot.help.message.detail.line2'));
            _reply.push(string.stringFromId('chattybot.help.message.detail.line3', config.prefix, string.stringFromId(command.name), string.stringFromId(command.usage)));
            _reply.push(string.stringFromId('chattybot.help.message.detail.line4', string.stringFromId(command.description, message.client.user)));
        }

        logger.log('error', `[discord.js] ${message.author} tried to use command, but no argument provided!`);
        message.channel.send(_reply);
        return false;
    }

    if (command.cooldown) {
        /* If user is on cooldown, cancel command run */
        const currentCooldown = cooldown.get(`${message.author.id}:${command.name}`);
        if (currentCooldown && currentCooldown > Date.now()) {
            const timeLeft = Math.round((currentCooldown - Date.now()) / 1000);
            message.channel.send(string.stringFromId('discord.error.cooldown', timeLeft));
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
        logger.log('error', `[discord.js] Failed to launch requested command!\n${err.stack}`);
        let _msg = [];
        _msg.push(string.stringFromId('discord.error.exception.line1'));
        if (!devFlag) _msg.push(string.stringFromId('discord.error.exception.line2.prod'));
        else _msg.push(string.stringFromId('discord.error.exception.line2.dev') + '\n```\n' + err.stack + '```');
        message.channel.send(_msg);
    }
}

function onVoiceStateUpdate(oldState, newState) {
    const message = oldState.member.lastMessage;
    const voice = voiceMap.get(oldState.guild.id);
    /* Auto-pause music player when everyone leaves voice channel */
    if (!voice || !voice.Player || !voice.Player.playState) return;
    if (oldState.channel.members.size < 2) {
        voice.Player.toggleState(voice);
        logger.log('verbose', `[discord.js] All users left channel, player auto-paused.`);
        if (message) message.channel.send(string.stringFromId('chattybot.music.auto_paused', voice.channel.name));
    }
}

// create or get webhook from sender's guild
async function createWebhook(message) {
    try {
        const webhook = await message.channel.createWebhook('Chatty-Webhook');
        logger.log('verbose', `[discord.js] Created webhook "${webhook}".`);
        return webhook;
    } catch (err) {
        logger.log('error', `[discord.js] Failed to create webhook.\n ${err.stack}`);
        return undefined;
    }
}

async function sendWebhook(message, text) {
    // Retrieve webhook
    const webhook = await createWebhook(message);
    if (!webhook) {
        // Fallback to old method
        message.channel.send(string.stringFromId('chattybot.tts.text.format', voice.channel.name, message.author, text));
        return;
    }

    // send webhook message
    try {
        await webhook.send(text, {
            username:message.guild.members.cache.get(message.author.id).nickname,
            avatarURL: message.author.avatarURL()
        });
        webhook.delete();
    } catch (err) {
        logger.log('error', `[discord.js] Failed to send webhook.\n ${err.stack}`);
        // Fallback to old method
        message.channel.send(string.stringFromId('chattybot.tts.text.format', voice.channel.name, message.author, text));
    }
}

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
        if (this._connection.status !== 0) {
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
    logger,
    onReady: onReadyEvent,
    onMessage: onMessageEvent,
    onVoiceUpdate: onVoiceStateUpdate,
    sendWebhook,
    Voice: VoiceClass,
    voiceMap
}