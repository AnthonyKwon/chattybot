const { logger } = require('../common');
const join = require('./join.js');
const discord = require('../discord.js');
const string = require('../stringManager.js');
const TTSClass = require('../textToSpeech.js');

/* array of settings item */
const ttsSettings = ['catty.settings.item.gender', 'catty.settings.item.locale', 'catty.settings.item.pitch',
    'catty.settings.item.speed', 'catty.settings.item.volume'];

async function commandSettings(message, args) {
    /* If not joined to voice channel, join first */
    if (!discord.voiceMap.get(message.guild.id)) {
        const response = await join.execute(message, []);
        if (response.result === 'FAIL') return;
    }
    const voice = discord.voiceMap.get(message.guild.id);
    /* If TTS is not initalized, do it first */
    if (!voice.TTS) voice.TTS = new TTSClass();

    if (args.length === 0) {
        /* List all available settings */
        let output = [];
        output.push(string.stringFromId('catty.settings.message.line1', message.client.user));
        output.push('*' + ttsSettings.map(s => string.stringFromId(s)).join(', ') + '*');
        output.push('\n' + string.stringFromId('catty.settings.message.line2'));
        message.channel.send(output);
    } else if (args.length === 1) {
        /* Show variable of specified setting */
        if (!ttsSettings.includes(string.idFromString(args[0]))) {
            message.channel.send(string.stringFromId('catty.settings.error.unknown_item'));
            commandSettings(message, []);
            return;
        } else {
            switch (string.idFromString(args[0])) {
                case 'catty.settings.item.gender':
                    message.channel.send(string.stringFromId('catty.setting.value.current',
                        string.stringFromId('catty.settings.item.gender'), voice.TTS.gender));
                    break;
                case 'catty.settings.item.locale':
                    message.channel.send(string.stringFromId('catty.setting.value.current',
                        string.stringFromId('catty.settings.item.locale'), voice.TTS.locale));
                    break;
                case 'catty.settings.item.pitch':
                    message.channel.send(string.stringFromId('catty.setting.value.current',
                        string.stringFromId('catty.settings.item.pitch'), voice.TTS.pitch + '%'));
                    break;
                case 'catty.settings.item.speed':
                    message.channel.send(string.stringFromId('catty.setting.value.current',
                        string.stringFromId('catty.settings.item.speed'), voice.TTS.speed + '%'));
                    break;
                case 'catty.settings.item.volume':
                    message.channel.send(string.stringFromId('catty.setting.value.current',
                        string.stringFromId('catty.settings.item.volume'), voice.TTS.volume + '%'));
                    break;
            }
        }
    } else {
        /* Change variable of specified setting */
        if (!ttsSettings.includes(string.idFromString(args[0]))) {
            message.channel.send(string.stringFromId('catty.settings.error.unknown_item'));
            commandSettings(message, []);
            return;
        } else {
            switch (string.idFromString(args[0])) {
                case 'catty.settings.item.gender':
                    voice.TTS.gender = args[1];
                    message.channel.send(string.stringFromId('catty.settings.changed',
                        string.stringFromId('catty.settings.item.gender'), voice.TTS.gender));
                    break;
                case 'catty.settings.item.locale':
                    await voice.TTS.setLocale(args[1]);
                    message.channel.send(string.stringFromId('catty.settings.changed',
                        string.stringFromId('catty.settings.item.locale'), voice.TTS.locale));
                    break;
                case 'catty.settings.item.pitch':
                    voice.TTS.pitch = args[1];
                    message.channel.send(string.stringFromId('catty.settings.changed',
                        string.stringFromId('catty.settings.item.pitch'), voice.TTS.pitch + '%'));
                    break;
                case 'catty.settings.item.speed':
                    voice.TTS.speed = args[1];
                    message.channel.send(string.stringFromId('catty.settings.changed',
                        string.stringFromId('catty.settings.item.speed'), voice.TTS.speed + '%'));
                    break;
                case 'catty.settings.item.volume':
                    voice.TTS.volume = args[1];
                    message.channel.send(string.stringFromId('catty.settings.changed',
                        string.stringFromId('catty.settings.item.volume'), voice.TTS.volume + '%'));
                    break;
            }
        }
    }
}

module.exports = {
    name: 'catty.command.settings',
    argsRequired: false,
    aliases: 'catty.command.settings.aliases',
    usage: 'catty.command.settings.usage',
    description: 'catty.command.settings.desc',
    execute: commandSettings
}