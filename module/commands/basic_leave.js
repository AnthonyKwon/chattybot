const discord = require('../discordwrapper.js');
const localize = require('../localization.js');

async function commandLeave(message) {
    // If not joined to voice channel, show error message
    if (!discord.voiceMap.get(message.guild.id)) {
        message.channel.send(localize.get('error.discord.voice.not_joined'));
        return;
    }
    const voice = discord.voiceMap.get(message.guild.id);
    // If player is available, kill it first
    if (voice.Player) voice.Player.stop(voice);
    const response = await voice.leave();
    if (response) {
        message.channel.send(localize.get('message.discord.voice.left', voice.channel.name));
        discord.voiceMap.delete(message.guild.id);
    } else {
        /* Is there a case that failed to leave voice channel? */
        throw new Error();
    }
    return;
}

module.exports = {
    name: 'leave',
    argsRequired: false,
    cooldown: 8,
    execute: commandLeave
}
