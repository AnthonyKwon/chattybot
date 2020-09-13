const music = require('../tannergabriel_yt');
const string = require('../stringResolver');

module.exports = {
    name: string.get('playSongCommandName'),
    argsRequired: true,
    aliases: [string.get('playSongCommandAliases')],
    description: string.get('playSongCommandDesc'),
    usage: string.get('playSongCommandUsage'),
    async execute(message, args) {
        const serverQueue = music.queue.get(message.guild.id);
        if (!args) music.play(message.guild, serverQueue);
        music.addQueue(message, serverQueue);
    }
}
