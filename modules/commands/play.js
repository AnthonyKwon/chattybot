const music = require('../tannergabriel_yt');
const string = require('../stringResolver');

module.exports = {
    name: string.get('playSongCommandName'),
    argsRequired: true,
    aliases: [string.get('playSongCommandAliases')],
    description: string.get('playSongCommandDesc'),
    usage: string.get('playSongCommandUsage'),
    async execute(message, args) {
        /* Actually, play is simmilar to addsong. */
        /* Parse music queue by author's current guild */
        const serverQueue = music.queue.get(message.guild.id);
        music.addQueue(message, serverQueue);
    }
}
