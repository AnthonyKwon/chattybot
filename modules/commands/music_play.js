const join = require('./basic_join.js');
const discord = require('../discord.js');
const PlayerClass = require('../player.js');
const string = require('../stringManager.js');

const devFlag = process.env.NODE_ENV === 'development' ? true : false;

async function musicPlay(message, args) {
    /* If not joined to voice channel, join first */
    if (!discord.voiceMap.get(message.guild.id)) {
        const response = await join.execute(message, []);
        if (response.result === 'FAIL') return { result: 'FAIL', app: 'discord.js', message: `Failed to join voice channel:\n{response}` };
    }
    const voice = discord.voiceMap.get(message.guild.id);
    /* If Player is not initalized, do it first */
    if (!voice.Player) voice.Player = new PlayerClass();
    /* Test input if it's valid youtube video */
    const input = args.join(' ');
    if (!voice.Player.validate(input)) {
        message.channel.send(string.stringFromId('chattybot.settings.error.unknown_item'));
        return { result: 'FAIL', app: 'discord.js', message: `Unknown input ${input} provided.` };
    }
    try {
        /* Add provided input to queue and get title from info */
        voice.Player.queue = input;
        const title = await voice.Player.getInfo(input);
        /* Check if player is running, and play music. */
        if (voice.Player.playState === true || (voice.Player.playState === false && voice.Player.queue.length > 1) || (voice.TTS && voice.TTS.speaking)) {
            message.channel.send(string.stringFromId('chattybot.music.playlist_added', title));
            return { result: 'SUCCESS', app: 'player', message: `Added ${title}(${input}) to music queue.` };
        }
        voice.Player.play(message);
        message.channel.send(string.stringFromId('chattybot.music.now_playing', title));
        /* If bot have message delete permission, delete user's message */
        if (message.guild.me.hasPermission('MANAGE_MESSAGES')) message.delete();
        return { result: 'SUCCESS', app: 'player', message: `Now playing ${title}(${input}).` };
    } catch(err) {
        let _msg = string.stringFromId('discord.error.exception.line1') + '\n';
        if (!devFlag) _msg += string.stringFromId('discord.error.exception.line2.prod');
        else _msg += string.stringFromId('discord.error.exception.line2.dev') + '\n```\n' + err.stack + '```';
        return { result: 'FAIL', app: 'discord.js', message: `Failed to launch requested command!`, exception: err.stack };
    }
}

module.exports = {
    name: 'chattybot.command.play',
    argsRequired: true,
    aliases: 'chattybot.command.play.aliases',
    usage: 'chattybot.command.play.usage',
    description: 'chattybot.command.play.desc',
    cooldown: 3,
    execute: musicPlay
}
