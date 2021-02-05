const ytsr = require('ytsr');
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
    try {
        let title = undefined;
        /* Add provided input to queue and get title from info */
        let inputSize = 0;
        if (await voice.Player.validate(input) === 'playlist') {
            const playlist = await voice.Player.parsePlaylist(input);
            voice.Player.concatQueue(playlist);
            title = await voice.Player.getTitle(input);
            title = string.stringFromId('chattybot.music.youtube_playlist', title[0], title.length - 1);
            inputSize = playlist.length;
        } else if (await voice.Player.validate(input) === 'video') {
            voice.Player.queue = input;
            title = await voice.Player.getTitle(input);
            inputSize = 1;
        } else {
            /* Search user input from youtube */
            const filters = await ytsr.getFilters(input);
            const filter = filters.get('Type').get('Video');
            const result = await ytsr(filter.url, { limit: 9 });
            const _title = [];
            const _url = [];
            const reply = [];
            result.items.forEach(item => _title.push(item.title));
            result.items.forEach(item => _url.push(item.url));
            reply.push(string.stringFromId('chattybot.music.search.choose_item'));
            _title.forEach(item => reply.push(string.stringFromId('chattybot.music.search.items', item)));
            const listMessage = await message.channel.send(reply);
            /* Prompt user for choice */
            const cmdFilter = message => message.content.match(/^(\d|x|X)$/g);
            const selection = await message.channel.awaitMessages(cmdFilter, { max: 1, time: 60000, errors: ['time'] });
            const command = selection.first().content;
            if (command.toUpperCase() === 'X') {
                /* User canceled command. Escape function */
                message.channel.send(string.stringFromId('chattybot.music.search.canceled'));
                return;
            }
            /* Remove user sent message commands & bot messages */
            if (message.guild.me.hasPermission('MANAGE_MESSAGES')) listMessage.delete();
            if (message.guild.me.hasPermission('MANAGE_MESSAGES')) selection.first().delete();
            /* Add user choice to queue */
            const choice = command.match(/[0-9]+/g);
            voice.Player.queue = _url[choice[0] - 1];
            title = _title[choice[0] - 1];
            inputSize = 1;
        }
        /* Check if player is running, and play music. */
        if (voice.Player.playState === true || (voice.Player.playState === false && voice.Player.queue.length > inputSize) || (voice.TTS && voice.TTS.speaking)) {
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
