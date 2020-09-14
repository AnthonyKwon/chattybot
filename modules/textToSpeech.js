const TTS = require('@google-cloud/text-to-speech');
const { bufferToStream, getUsername } = require('./common');
const string = require('./stringResolver');
const voice = require('./discordAudio');

const client = new TTS.TextToSpeechClient();
let lastAuthor, ssmlGender = 'FEMALE', speed = '1.0', pitch = '0.0', volumeGain = '0.0';

const requestSample = {
    input: { text: 'This is a sample text.' },
    voice: { languageCode: string.get('ttsLocale'), ssmlGender: ssmlGender },
    audioConfig: { audioEncoding: 'OGG_OPUS', speakingRate: speed, pitch: pitch, volumeGainDb: volumeGain }
};

const tts_speak = async (message, text) => {
    let request = requestSample;
    /* Replace all parameters */
    if (lastAuthor !== message.author || voice.isInturrupted()) {
        request.input = { ssml: '<speak>' + string.get('ttsPrefix').format(getUsername(message)) + '<break time="0.5s"/>' + text + '</speak>' };
    } else {
        request.input = { text: text }
    }
    request.voice.ssmlGender = ssmlGender;
    request.audioConfig.speakingRate = speed;
    request.audioConfig.pitch = pitch
    request.audioConfig.volumeGainDb = volumeGain;

    lastAuthor = message.author;
    const [response] = await client.synthesizeSpeech(request);
    const stream = bufferToStream(response.audioContent);
    return voice.play(message, stream, { type: 'ogg/opus' }, true);
}

const tts_config = (key, value) => {
    switch (key) {
        case 'ssmlGender':
            if (ssmlGender === value) return false;
            ssmlGender = value;
            return true;
            break;
        case 'speakingRate':
            speed = value;
            return true;
            break;
        case 'pitch':
            pitch = value;
            return true;
            break;
        case 'volumeGainDb':
            if (volumeGain === value) return false;
            volumeGain = value;
            return true;
            break;
    }
    return false;
}

module.exports = {
    speak: tts_speak,
    config: tts_config
}
