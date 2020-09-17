const music = require('../tannergabriel_yt');
const string = require('../stringResolver');
const name = string.get('skipCommandName');

module.exports = {
    name,
    aliases: [string.get('skipCommandAliases')],
    description: string.get('skipCommandDesc'),
    async execute(message) {
        /* Parse music queue by author's current guild */
        const serverQueue = music.queue.get(message.guild.id);
        music.skip(message, serverQueue);
    }
}
