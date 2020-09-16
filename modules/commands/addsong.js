const music = require('../tannergabriel_yt');
const string = require('../stringResolver');

module.exports = {
    name: string.get('addSongCommandName'),
    argsRequired: true,
    aliases: [string.get('addSongCommandAliases')],
    description: string.get('addSongCommandDesc'),
    usage: string.get('addSongCommandUsage'),
    async execute(message, args) {
        /* Parse music queue by author's current guild */
        const serverQueue = music.queue.get(message.guild.id);
        music.addQueue(message, serverQueue);
    }
}
