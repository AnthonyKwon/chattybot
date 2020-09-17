const music = require('../tannergabriel_yt');
const string = require('../stringResolver');
const name = string.get('playCommandName');

module.exports = {
    name,
    argsRequired: true,
    aliases: [string.get('playCommandAliases')],
    description: string.get('playCommandDesc'),
    usage: string.get('playCommandUsage'),
    async execute(message) {
        /* Actually, play is simmilar to addsong. */
        /* Parse music queue by author's current guild */
        const serverQueue = music.queue.get(message.guild.id);
        music.addQueue(message, serverQueue);
    }
}
