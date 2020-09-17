/* Google's Text-to-Speech Library Loader */
const path = require('path');
const TTS = require('@google-cloud/text-to-speech');
const { bufferToStream, getUsername, logger } = require('./common');
const config = require('./configLoader');
const { projectId } = config.load(['project_id']);
const string = require('./stringResolver');
const voice = require('./discordAudio');

/* Get GCP project ID and key file name */
const client = new TTS.TextToSpeechClient({ projectId, keyFilename: path.join(__dirname, '../configs/gcp-credentials.json') });
const request = new Map();
let lastAuthor;

/* Initialize TTS request */
const tts_init = message => {
    const reqTemplate = {
        input: { text: 'This is a sample text.' },
        voice: { languageCode: string.get('ttsLocale'), ssmlGender: 'NEUTRAL' },
        audioConfig: { audioEncoding: 'OGG_OPUS', speakingRate: '1.0', pitch: '1.0', volumeGainDb: '0.0' }
    };
    request.set(message.guild.id, reqTemplate);
    return;
}

const tts_speak = async (message, text) => {
    /* If current guild's tts request not initialized, do it first. */
    if (!request.get(message.guild.id)) tts_init(message);
    const guildRequest = request.get(message.guild.id);
    /* If message author or channel is different, send TTS w/ prefix. */
    if (lastAuthor !== message.author || voice.isInturrupted(message.guild.id)) {
        guildRequest.input = { ssml: '<speak>' + string.get('ttsPrefix').format(getUsername(message)) + 
            '<break time="0.5s"/>' + text + '</speak>' };
    /* If not, send just text only */
    } else guildRequest.input = { text: text };
    const [response] = await client.synthesizeSpeech(request.get(message.guild.id));
    /* Google sends response as buffer. We need to convert it as ReadableStream. */
    const stream = bufferToStream(response.audioContent);
    return voice.play(message, stream, { type: 'ogg/opus' });
}

const tts_config = (key, value, message, name) => {
    /* If current guild's tts request not initialized, do it first. */
    if (!request.get(message.guild.id)) tts_init(message);
    const guildRequest = request.get(message.guild.id);
    try {
        /* set request option */
        if (key === 'ssmlGender') guildRequest.voice.ssmlGender = value;
        else guildRequest.audioConfig[key] = value;
        /* send success message */
        logger.log('info', `[google-tts] ${key} changed to ${value}.`);
        message.channel.send(string.get('propChangeSuccessful').format(key, value));
    } catch (err) {
        logger.log('error', `[google-tts] Failed to change ${string.get(`${name}CommandName`)}: ${err.stack}`);
        message.channel.send(string.get('propChangeFailed').format(string.get(`${name}CommandName`)));
    }
    return;
}

module.exports = {
    speak: tts_speak,
    config: tts_config
}
