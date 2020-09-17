const music = require('../tannergabriel_yt');
const string = require('../stringResolver');
const name = string.get('pauseCommandName');

module.exports = {
    name,
    aliases: [string.get('pauseCommandAliases')],
    description: string.get('pauseCommandDesc'),
    async execute(message) {
        const serverQueue = music.queue.get(message.guild.id);
        music.pause(message, serverQueue);
    }
}
