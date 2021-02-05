const discord = require('../discord.js');
const PlayerClass = require('../player.js');
const string = require('../stringManager.js');

const devFlag = process.env.NODE_ENV === 'development' ? true : false;

async function musicSkip(message) {
    /* If not joined to voice channel, show error and exit */
    if (!discord.voiceMap.get(message.guild.id)) {
        message.channel.send(string.stringFromId('chattybot.music.error.not_playing'));
        return { result: 'FAIL', app: 'discord.js', message: `Failed to join voice channel:\n{response}` };
    }
    const voice = discord.voiceMap.get(message.guild.id);
    /* If music player is already not running, show error and exit */
    if (!voice.Player || !voice.Player.queue.length === 0) {
        message.channel.send(string.stringFromId('chattybot.music.error.not_playing'));
        return { result: 'FAIL', app: 'player', message: `${message.author} tried to change skip song, but playlist was empty.` };
    }

    try {
        const skipped = await voice.Player.skip(voice);
        if (skipped) message.channel.send(string.stringFromId('chattybot.music.skipped', await voice.Player.getTitle(skipped)));
        if (voice.Player.queue.length >= 1) message.channel.send(string.stringFromId('chattybot.music.now_playing',
            await voice.Player.getTitle(voice.Player.queue[0])));
        return;
    } catch(err) {
        let _msg = string.stringFromId('discord.error.exception.line1') + '\n';
        if (!devFlag) _msg += string.stringFromId('discord.error.exception.line2.prod');
        else _msg += string.stringFromId('discord.error.exception.line2.dev') + '\n```\n' + err.stack + '```';
        return { result: 'FAIL', app: 'discord.js', message: `Failed to launch requested command!`, exception: err.stack };
    }
}

module.exports = {
    name: 'chattybot.command.skip',
    argsRequired: false,
    aliases: 'chattybot.command.skip.aliases',
    description: 'chattybot.command.skip.desc',
    cooldown: 3,
    execute: musicSkip
}
