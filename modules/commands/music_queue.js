const discord = require('../discord.js');
const PlayerClass = require('../player.js');
const string = require('../stringManager.js');

async function musicQueue(message, args) {
    /* If not joined to voice channel, cancel command */
    if (!discord.voiceMap.get(message.guild.id)) {
        message.channel.send(string.stringFromId('chattybot.music.playlist.empty'));
        return;
    }
    const voice = discord.voiceMap.get(message.guild.id);
    /* If music player is already not running, cancel command */
    if (!voice.Player || !voice.Player.queue.length === 0) {
        message.channel.send(string.stringFromId('chattybot.music.playlist.empty'));
        return;
    }

    message.channel.send(string.stringFromId('chattybot.music.playlist.parsing'));   
    const count = 10; // count of items shown in playlist
    const start = (parseInt(args[0]) - 1) > 0 && (parseInt(args[0]) - 1) * count <
     voice.Player.queue.length ?
    parseInt(args[0] - 1) * count : 0; // start point of playlist
    const playlist = await voice.Player.getQueueList(start, count);
    const output = [];
    output.push(string.stringFromId('chattybot.music.playlist.line1', message.client.user));
    output.push(string.stringFromId('chattybot.music.playlist.line2',
        Math.floor(voice.Player.queue.length / count) + 1, Math.floor(start / count) + 1));
    playlist.map(item => {
        if (start === 0 && playlist.indexOf(item) === 0)
            output.push(string.stringFromId('chattybot.music.playlist.current', item.videoDetails.title));
        else
            output.push(string.stringFromId('chattybot.music.playlist.late',
                playlist.indexOf(item) + 1, item.videoDetails.title));
    });
    message.channel.send(output);
}

module.exports = {
    name: 'chattybot.command.queue',
    argsRequired: false,
    aliases: 'chattybot.command.queue.aliases',
    usage: 'chattybot.command.queue.usage',
    description: 'chattybot.command.queue.desc',
    cooldown: 3,
    execute: musicQueue
}
