const music = require('../tannergabriel_yt');
const string = require('../stringResolver');
const name = string.get('stopCommandName');

module.exports = {
    name,
    aliases: [string.get('stopCommandAliases')],
    description: string.get('stopCommandDesc'),
    async execute(message) {
        /* Parse music queue by author's current guild */
        const serverQueue = music.queue.get(message.guild.id);
        music.stop(message, serverQueue);
    }
}
