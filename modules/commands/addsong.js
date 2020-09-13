const music = require('../tannergabriel_yt');
const string = require('../stringResolver');

module.exports = {
    name: string.get('addSongCommandName'),
    argsRequired: true,
    aliases: [string.get('addSongCommandAliases')],
    description: string.get('addSongCommandDesc'),
    usage: string.get('addSongCommandUsage'),
    async execute(message, args) {
        const serverQueue = music.queue.get(message.guild.id);
        music.addQueue(message, serverQueue);
    }
}
