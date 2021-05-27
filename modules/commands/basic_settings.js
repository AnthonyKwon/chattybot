const join = require('../commands/basic_join.js');
const discord = require('../discordwrapper.js');
const localize = require('../localization.js');
const TTSClass = require('../textToSpeech.js');

/* array of settings item */
const ttsSettings = ['chattybot.settings.item.gender', 'chattybot.settings.item.locale', 'chattybot.settings.item.pitch',
    'chattybot.settings.item.speed', 'chattybot.settings.item.volume'];

async function commandSettings(message, args) {
    /* If not joined to voice channel, join first */
    if (!discord.voiceMap.get(message.guild.id)) {
        const response = await join.execute(message, []);
        if (!response) return false;
    }
    const voice = discord.voiceMap.get(message.guild.id);
    /* If TTS is not initalized, do it first */
    if (!voice.TTS) voice.TTS = new TTSClass();

    if (args.length === 0) {
        /* List all available settings */
        let output = [];
        output.push(localize.get('chattybot.settings.message.line1', message.client.user));
        output.push('*' + ttsSettings.map(s => localize.get(s)).join(', ') + '*');
        output.push('\n' + localize.get('chattybot.settings.message.line2'));
        message.channel.send(output);
    } else if (args.length === 1) {
        /* Show variable of specified setting */
        if (!ttsSettings.includes(string.idFromString(args[0]))) {
            message.channel.send(localize.get('chattybot.settings.error.unknown_item'));
            commandSettings(message, []);
            return false;
        } else {
            switch (string.idFromString(args[0])) {
                case 'chattybot.settings.item.gender':
                    message.channel.send(localize.get('chattybot.setting.value.current',
                        localize.get('chattybot.settings.item.gender'), voice.TTS.gender));
                    break;
                case 'chattybot.settings.item.locale':
                    message.channel.send(localize.get('chattybot.setting.value.current',
                        localize.get('chattybot.settings.item.locale'), voice.TTS.locale));
                    break;
                case 'chattybot.settings.item.pitch':
                    message.channel.send(localize.get('chattybot.setting.value.current',
                        localize.get('chattybot.settings.item.pitch'), voice.TTS.pitch + '%'));
                    break;
                case 'chattybot.settings.item.speed':
                    message.channel.send(localize.get('chattybot.setting.value.current',
                        localize.get('chattybot.settings.item.speed'), voice.TTS.speed + '%'));
                    break;
                case 'chattybot.settings.item.volume':
                    message.channel.send(localize.get('chattybot.setting.value.current',
                        localize.get('chattybot.settings.item.volume'), voice.volume + '%'));
                    break;
            }
        }
    } else {
        /* Change variable of specified setting */
        if (!ttsSettings.includes(string.idFromString(args[0]))) {
            message.channel.send(localize.get('chattybot.settings.error.unknown_item'));
            commandSettings(message, []);
            return false;
        } else {
            switch (string.idFromString(args[0])) {
                case 'chattybot.settings.item.gender':
                    voice.TTS.gender = args[1];
                    message.channel.send(localize.get('chattybot.settings.changed',
                        localize.get('chattybot.settings.item.gender'), localize.get('google.tts.gender.' + voice.TTS.gender)));
                    break;
                case 'chattybot.settings.item.locale':
                    await voice.TTS.setLocale(args[1]);
                    message.channel.send(localize.get('chattybot.settings.changed',
                        localize.get('chattybot.settings.item.locale'), voice.TTS.locale));
                    break;
                case 'chattybot.settings.item.pitch':
                    voice.TTS.pitch = args[1];
                    message.channel.send(localize.get('chattybot.settings.changed',
                        localize.get('chattybot.settings.item.pitch'), voice.TTS.pitch + '%'));
                    break;
                case 'chattybot.settings.item.speed':
                    voice.TTS.speed = args[1];
                    message.channel.send(localize.get('chattybot.settings.changed',
                        localize.get('chattybot.settings.item.speed'), voice.TTS.speed + '%'));
                    break;
                case 'chattybot.settings.item.volume':
                    voice.volume = args[1];
                    message.channel.send(localize.get('chattybot.settings.changed',
                        localize.get('chattybot.settings.item.volume'), voice.volume + '%'));
                    break;
            }
        }
    }
}

module.exports = {
    name: 'settings',
    argsRequired: false,
    cooldown: 8,
    execute: commandSettings
}