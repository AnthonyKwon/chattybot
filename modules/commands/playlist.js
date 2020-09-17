const music = require('../tannergabriel_yt');
const string = require('../stringResolver');
const name = string.get('playlistCommandName');

module.exports = {
    name,
    aliases: [string.get('playlistCommandAliases')],
    description: string.get('playlistCommandDesc'),
    usage: string.get('playlistCommandUsage'),
    async execute(message, args) {
        /* Parse music queue by author's current guild */
        const serverQueue = music.queue.get(message.guild.id);
        music.listQueue(message, serverQueue, args[0]);
    }
}
