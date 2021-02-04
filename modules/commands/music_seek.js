const discord = require('../discord.js');
const PlayerClass = require('../player.js');
const string = require('../stringManager.js');

const devFlag = process.env.NODE_ENV === 'development' ? true : false;

function formattedToMilli(value) {
    let result = 0;
    if (typeof value === 'object') {
        switch (value.length) {
            case 2:
                result = (value[0] * 60000) + (value[1] * 1000);
                break;
            case 3:
                result = (value[0] * 3600000) + (value[1] * 60000) + (value[2] * 1000);
                break;
            default:
                result = -1;
        }
    } else {
            result = value * 1000;
    }
    return result;
}

async function musicSeek(message, args) {
    /* If not joined to voice channel, show error and exit */
    if (!discord.voiceMap.get(message.guild.id)) {
        message.channel.send(string.stringFromId('chattybot.music.error.not_playing'));
        return { result: 'FAIL', app: 'discord.js', message: `Failed to join voice channel:\n{response}` };
    }
    const voice = discord.voiceMap.get(message.guild.id);
    /* If music player is already not running, show error and exit */
    if (!voice.Player || !voice.Player.playState) {
        message.channel.send(string.stringFromId('chattybot.music.error.not_playing'));
        return { result: 'FAIL', app: 'player', message: `${message.author} tried to change seek time, but music was not playing.` };
    }
    
    /* raw input and converted */
    const timeInput = args[0].includes(':') ? args[0].split(':') : args[0];
    const milli = formattedToMilli(timeInput);
    try {
        /* If time is invalid, cancel seeking */
        if (milli === -1) {
            message.channel.send(string.stringFromId('chattybot.music.error.invalid_time'));
            return { result: 'FAIL' };
        }
        const response = await voice.Player.seek(voice, milli);
        if (response.result === 'SUCCESS') message.channel.send(string.stringFromId('chattybot.music.seeked'));
        else message.channel.send(string.stringFromId(`chattybot.music.error.${response.reason}`));
        return response;
    } catch(err) {
        let _msg = string.stringFromId('discord.error.exception.line1') + '\n';
        if (!devFlag) _msg += string.stringFromId('discord.error.exception.line2.prod');
        else _msg += string.stringFromId('discord.error.exception.line2.dev') + '\n```\n' + err.stack + '```';
        return { result: 'FAIL', app: 'discord.js', message: `Failed to launch requested command!`, exception: err.stack };
    }
}

module.exports = {
    name: 'chattybot.command.seek',
    argsRequired: true,
    aliases: 'chattybot.command.seek.aliases',
    usage: 'chattybot.command.seek.usage',
    description: 'chattybot.command.seek.desc',
    cooldown: 3,
    execute: musicSeek
}
