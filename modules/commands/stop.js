const music = require('../tannergabriel_yt');
const string = require('../stringResolver');

module.exports = {
    name: string.get('stopSongCommandName'),
    aliases: [string.get('stopSongCommandAliases')],
    description: string.get('stopSongCommandDesc'),
    async execute(message, args) {
        /* Parse music queue by author's current guild */
        const serverQueue = music.queue.get(message.guild.id);
        music.stop(message, serverQueue);
    }
}
