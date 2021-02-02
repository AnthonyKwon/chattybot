const join = require('./basic_join.js');
const discord = require('../discord.js');
const string = require('../stringManager.js');
const TTSClass = require('../textToSpeech.js');

/* array of settings item */
const ttsSettings = ['chattybot.settings.item.gender', 'chattybot.settings.item.locale', 'chattybot.settings.item.pitch',
    'chattybot.settings.item.speed', 'chattybot.settings.item.volume'];

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
        output.push(string.stringFromId('chattybot.settings.message.line1', message.client.user));
        output.push('*' + ttsSettings.map(s => string.stringFromId(s)).join(', ') + '*');
        output.push('\n' + string.stringFromId('chattybot.settings.message.line2'));
        message.channel.send(output);
    } else if (args.length === 1) {
        /* Show variable of specified setting */
        if (!ttsSettings.includes(string.idFromString(args[0]))) {
            message.channel.send(string.stringFromId('chattybot.settings.error.unknown_item'));
            commandSettings(message, []);
            return;
        } else {
            switch (string.idFromString(args[0])) {
                case 'chattybot.settings.item.gender':
                    message.channel.send(string.stringFromId('chattybot.setting.value.current',
                        string.stringFromId('chattybot.settings.item.gender'), voice.TTS.gender));
                    break;
                case 'chattybot.settings.item.locale':
                    message.channel.send(string.stringFromId('chattybot.setting.value.current',
                        string.stringFromId('chattybot.settings.item.locale'), voice.TTS.locale));
                    break;
                case 'chattybot.settings.item.pitch':
                    message.channel.send(string.stringFromId('chattybot.setting.value.current',
                        string.stringFromId('chattybot.settings.item.pitch'), voice.TTS.pitch + '%'));
                    break;
                case 'chattybot.settings.item.speed':
                    message.channel.send(string.stringFromId('chattybot.setting.value.current',
                        string.stringFromId('chattybot.settings.item.speed'), voice.TTS.speed + '%'));
                    break;
                case 'chattybot.settings.item.volume':
                    message.channel.send(string.stringFromId('chattybot.setting.value.current',
                        string.stringFromId('chattybot.settings.item.volume'), voice.TTS.volume + '%'));
                    break;
            }
        }
    } else {
        /* Change variable of specified setting */
        if (!ttsSettings.includes(string.idFromString(args[0]))) {
            message.channel.send(string.stringFromId('chattybot.settings.error.unknown_item'));
            commandSettings(message, []);
            return;
        } else {
            switch (string.idFromString(args[0])) {
                case 'chattybot.settings.item.gender':
                    voice.TTS.gender = args[1];
                    message.channel.send(string.stringFromId('chattybot.settings.changed',
                        string.stringFromId('chattybot.settings.item.gender'), string.stringFromId('google.tts.gender.' + voice.TTS.gender)));
                    break;
                case 'chattybot.settings.item.locale':
                    await voice.TTS.setLocale(args[1]);
                    message.channel.send(string.stringFromId('chattybot.settings.changed',
                        string.stringFromId('chattybot.settings.item.locale'), voice.TTS.locale));
                    break;
                case 'chattybot.settings.item.pitch':
                    voice.TTS.pitch = args[1];
                    message.channel.send(string.stringFromId('chattybot.settings.changed',
                        string.stringFromId('chattybot.settings.item.pitch'), voice.TTS.pitch + '%'));
                    break;
                case 'chattybot.settings.item.speed':
                    voice.TTS.speed = args[1];
                    message.channel.send(string.stringFromId('chattybot.settings.changed',
                        string.stringFromId('chattybot.settings.item.speed'), voice.TTS.speed + '%'));
                    break;
                case 'chattybot.settings.item.volume':
                    voice.TTS.volume = args[1];
                    message.channel.send(string.stringFromId('chattybot.settings.changed',
                        string.stringFromId('chattybot.settings.item.volume'), voice.TTS.volume + '%'));
                    break;
            }
        }
    }
}

module.exports = {
    name: 'chattybot.command.settings',
    argsRequired: false,
    aliases: 'chattybot.command.settings.aliases',
    usage: 'chattybot.command.settings.usage',
    description: 'chattybot.command.settings.desc',
    cooldown: 15,
    execute: commandSettings
}