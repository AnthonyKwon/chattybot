const join = require('./basic_join.js');
const discord = require('../discord.js');
const PlayerClass = require('../player.js');
const string = require('../stringManager.js');

async function musicQueue(message, args) {
    /* If not joined to voice channel, join first */
    if (!discord.voiceMap.get(message.guild.id)) return;
    const voice = discord.voiceMap.get(message.guild.id);
    /* If music player is already not running, cancel command */
    if (!voice.Player) return;
    const playlist = voice.Player.queue;
    const pages = Math.ceil(playlist.length / 10);
    const currPage = args[0] <= pages ? args[0] : pages;
    const maxIndex = (playlist.length - 1) >= currPage * 10 ? currPage * 10 : playlist.length - 1;
    const output = [];
    output.push(string.stringFromId('chattybot.music.playlist.line1', message.client.user));
    output.push(string.stringFromId('chattybot.music.playlist.line2', currPage, pages));
    for (let i = 0; i <= maxIndex; i++) {
        if (currPage === 1 && i === 0) {
            output.push(string.stringFromId('chattybot.music.playlist.current',
                await voice.Player.getInfo(playlist[(10 * (pages - 1)) + i])));
        }
        else {
            output.push(string.stringFromId('chattybot.music.playlist.late', (10 * (pages - 1)) + i + 1,
                await voice.Player.getInfo(playlist[(10 * (pages - 1)) + i])));
        }
    }
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
