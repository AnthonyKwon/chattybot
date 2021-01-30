const music = require('../tannergabriel_yt');
const string = require('../stringResolver');
const name = string.get('addsongCommandName');

module.exports = {
    name,
    argsRequired: true,
    aliases: [string.get('addsongCommandAliases')],
    description: string.get('addsongCommandDesc'),
    usage: string.get('addsongCommandUsage'),
    async execute(message, args) {
        /* Parse music queue by author's current guild */
        const serverQueue = music.queue.get(message.guild.id);
        music.addQueue(message, serverQueue);
    }
}
