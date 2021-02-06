const discord = require('../discord.js');
const logger = require('../logger.js');
const PlayerClass = require('../player.js');
const string = require('../stringManager.js');

const devFlag = process.env.NODE_ENV === 'development' ? true : false;

async function musicSkip(message) {
    /* If not joined to voice channel, show error and exit */
    if (!discord.voiceMap.get(message.guild.id)) {
        message.channel.send(string.stringFromId('chattybot.music.error.not_playing'));
        return false;
    }
    const voice = discord.voiceMap.get(message.guild.id);
    /* If music player is already not running, show error and exit */
    if (!voice.Player || !voice.Player.queue.length === 0) {
        message.channel.send(string.stringFromId('chattybot.music.error.not_playing'));
        return false;
    }

    try {
        const skipped = await voice.Player.skip(voice);
        if (skipped) {
            logger.log('verbose', `[Player] Skipped ${skipped}.`);
            message.channel.send(string.stringFromId('chattybot.music.skipped', await voice.Player.getTitle(skipped)));
        }
        if (voice.Player.queue.length >= 1) message.channel.send(string.stringFromId('chattybot.music.now_playing',
            await voice.Player.getTitle(voice.Player.queue[0])));
        return true;
    } catch(err) {
        logger.log('error', `[Player] Error occured while skipping!\n${err.stack}\n`);
        let _msg = string.stringFromId('discord.error.exception.line1') + '\n';
        if (!devFlag) _msg += string.stringFromId('discord.error.exception.line2.prod');
        else _msg += string.stringFromId('discord.error.exception.line2.dev') + '\n```\n' + err.stack + '```';
        return false;
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
