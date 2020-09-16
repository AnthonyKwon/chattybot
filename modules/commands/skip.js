const music = require('../tannergabriel_yt');
const string = require('../stringResolver');

module.exports = {
    name: string.get('skipSongCommandName'),
    aliases: [string.get('skipSongCommandAliases')],
    description: string.get('skipSongCommandDesc'),
    async execute(message) {
        /* Parse music queue by author's current guild */
        const serverQueue = music.queue.get(message.guild.id);
        music.skip(message, serverQueue);
    }
}
