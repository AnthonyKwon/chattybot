const TTS = require('@google-cloud/text-to-speech');
const { getUsername } = require('./common');
const string = require('./stringResolver');
const { Readable } = require('stream');

const client = new TTS.TextToSpeechClient();
let lastAuthor, lastChannel;
let ssmlGender = 'FEMALE', speed = '1.0', pitch = '0.0', volumeGain = '0.0';

const requestSample = {
    input: { text: 'This is a sample text.' },
    voice: { languageCode: string.get('ttsLocale'), ssmlGender: ssmlGender },
    audioConfig: { audioEncoding: 'OGG_OPUS', speakingRate: speed, pitch: pitch, volumeGainDb: volumeGain }
};

/*
 * @param binary Buffer
 * returns readableInstanceStream Readable
 * https://stackoverflow.com/a/54136803
 */
const bufferToStream = (binary) => {
    const readableInstanceStream = new Readable({
        read() {
            this.push(binary);
            this.push(null);
        }
    });
    return readableInstanceStream;
}

const tts_speak = async (connection, message, text) => {
    let request = requestSample;
    /* Replace all parameters */
    if ((message.author !== lastAuthor) || (connection.channel.id !== lastChannel)) {
        request.input = { ssml: '<speak>' + string.get('ttsPrefix').format(getUsername(message)) + '<break time="0.5s"/>' + text + '</speak>' };
    } else {
        request.input = { text: text }
    }
    request.voice.ssmlGender = ssmlGender;
    request.audioConfig.speakingRate = speed;
    request.audioConfig.pitch = pitch
    request.audioConfig.volumeGainDb = volumeGain;

    console.log(request) /* Debug */
    lastAuthor = message.author;
    lastChannel = connection.channel.id;
    const [response] = await client.synthesizeSpeech(request);
    const stream = bufferToStream(response.audioContent);
    connection.play(stream, { type: 'ogg/opus' });
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
