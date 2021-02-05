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
    /* Test input if it's valid youtu%재생 https://www.youtube.com/watch?v=wBTpAw2famk&list=PLB5vexwf7WGmGk2Wi6OjQo12ILzyh-1Vpbe video */
    const input = args.join(' ');
    if (!voice.Player.validate(input)) {
        message.channel.send(string.stringFromId('chattybot.settings.error.unknown_item'));
        return { result: 'FAIL', app: 'discord.js', message: `Unknown input ${input} provided.` };
    }
    try {
        let title = undefined;
        /* Add provided input to queue and get title from info */
        if (voice.Player.validate(input) === 'playlist') {
            const playlist = await voice.Player.parsePlaylist(input);
            voice.Player.concatQueue(playlist);
            title = await voice.Player.getTitle(input);
            title = string.stringFromId('chattybot.music.youtube_playlist', title[0], title.length - 1);
        } else if (voice.Player.validate(input) === 'video') {
            voice.Player.queue = input;
            title = await voice.Player.getTitle(input);
        }
        console.log(title);
        /* Check if player is running, and play music. */
        if (voice.Player.playState === true || (voice.Player.playState === false && voice.Player.queue.length > input.length) || (voice.TTS && voice.TTS.speaking)) {
            message.channel.send(string.stringFromId('chattybot.music.playlist_added', title));
            /* If bot have message delete permission, delete user's message */
            if (message.guild.me.hasPermission('MANAGE_MESSAGES')) message.delete();
            return { result: 'SUCCESS', app: 'player', message: `Added ${title}(${input}) to music queue.` };
        }
        voice.Player.play(voice);
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
