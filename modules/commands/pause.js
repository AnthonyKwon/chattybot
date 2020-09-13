const music = require('../tannergabriel_yt');
const string = require('../stringResolver');

module.exports = {
    name: string.get('pauseSongCommandName'),
    aliases: [string.get('pauseSongCommandAliases')],
    description: string.get('pauseSongCommandDesc'),
    async execute(message, args) {
        const serverQueue = music.queue.get(message.guild.id);
        music.pause(message, serverQueue);
    }
}
