const Discord = require('discord.js');
const configManager = require('./configManager.js');
const string = require('./stringManager.js');

let _logger = undefined;
const devFlag = process.env.NODE_ENV === 'development' ? true : false;
const config = configManager.read('prefix');
const cooldown = new Map();

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
function onReadyEvent(client, logger, status) {
    _logger = logger;
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
    if (devFlag && message.member.roles.cache.some(role => role.name === 'Discord Bot Developer')) {
        _logger.log('verbose',`[discord.js] ${message.author.tag} issued command: ${message.content}`);
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

        return message.channel.send(_reply);
    }

    if (command.cooldown) {
        /* If user is on cooldown, cancel command run */
        const currentCooldown = cooldown.get(`${message.author.id}:${command.name}`);
        if (currentCooldown && currentCooldown > Date.now()) {
            const timeLeft = Math.round((currentCooldown - Date.now()) / 1000);
            message.channel.send(string.stringFromId('discord.error.cooldown', timeLeft));
            return;
        }

        /* Register user on cooldown timer */
        cooldown.set(`${message.author.id}:${command.name}`, Date.now() + (command.cooldown * 1000));
        setTimeout(() => cooldown.delete(`${message.author.id}:${command.name}`), command.cooldown * 1000);
    }

    try {
        const response = await command.execute(message, args);
        if (response && response.message) {
            if (response.result == 'SUCCESS') _logger.log('info', `[${response.app}] ${response.message}`);
            else _logger.log('error', `[${response.app}] ${response.message ? response.message : 'Error occured while launching command!'}\n${response.exception}`);
        }
    } catch (err) {
        _logger.log('error', `[discord.js] Failed to launch requested command!\n${err.stack}`);
        let _msg = [];
        _msg.push(string.stringFromId('discord.error.exception.line1'));
        if (!devFlag) _msg.push(string.stringFromId('discord.error.exception.line2.prod'));
        else _msg.push(string.stringFromId('discord.error.exception.line2.dev') + '\n```\n' + err.stack + '```');
        message.channel.send(_msg);
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
        this._tts = new Map();
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

    /* set-get TTS variable (to passed value) */
    set TTS(value) {
        this._tts.set(this._guildId, value);
    }
    get TTS() {
        return this._tts.get(this._guildId);
    }

    /* join discord voice connection */
    async join(message, channelId=undefined) {
        /* check if user joined in any voice channel or passed channel id */
        if (!channelId && !message.member.voice.channel) {
            return { result: 'FAIL', reason: 'specify_or_join_channel' };
        }
        const selectedId = channelId ? channelId : message.member.voice.channel.id;
        /* check if channel is available */
        const channel = message.client.channels.cache.get(selectedId);
        if (!channel) {
            return { result: 'FAIL', reason: 'unknown_channel' };
        }
        /* check if bot has permission to join target channel */
        const permissions = channel.permissionsFor(message.client.user);
        if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
            return { result: 'FAIL', reason: 'no_permission' };
        }

        /* Try to join voice channel */
        try {
            this._connection = await channel.join();
            _logger.log('verbose', `[discord.js] Joined voice channel ${this._connection.channel.id}`);
            /* Set speaking status to none */
            this._connection.setSpeaking(0);
            /* set channel info */
            this._channel.id = this._connection.channel.id;
            this._channel.name = this._connection.channel.name;
            return { result: 'SUCCESS' };
        } catch (err) {
            _logger.log('error', `[discord.js] An error occured while connected to voice channel: \n${err.stack}`);
            return { result: 'FAIL', reason: 'exception', stack: err.stack };
        }
    }

    play(stream, option=undefined) {
        /* Join voice channel first if not */
        if (this._connection.status !== 0) {
            return { result: 'FAIL', reason: 'specify_or_join_channel' };
        }
        return this._connection.play(stream, option);
    }

    /* leave discord voice connection */
    async leave() {
        if (this._connection.status !== 0) return;
        this._connection.disconnect();
        _logger.log('verbose', `[discord.js] Left voice channel.`);
        return { result: 'SUCCESS' };
    }
}

module.exports = {
    onReady: onReadyEvent,
    onMessage: onMessageEvent,
    Voice: VoiceClass,
    voiceMap: new Map()
}