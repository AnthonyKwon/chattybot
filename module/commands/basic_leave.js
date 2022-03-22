const localize = require('../localization.js');
const VoiceClass = require('../../class/discordwrapper/VoiceClass');

async function commandLeave(message) {
    // If not joined to voice channel, show error message
    if (!message.client.voice.session.get(message.guild.id)) {
        message.channel.send(localize.get('error.discord.voice.not_joined'));
        return;
    }
    const voice = message.client.voice.session.get(message.guild.id);
    // If player is available, kill it first
    if (voice.Player) voice.Player.stop(voice);
    const response = await voice.leave();
    if (response) {
        message.channel.send(localize.get('message.discord.voice.left', voice.channel.name));
        message.client.voice.session.delete(message.guild.id);
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
