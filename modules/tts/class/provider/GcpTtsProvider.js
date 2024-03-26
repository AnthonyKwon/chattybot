const GcpTtsExt = require('@google-cloud/text-to-speech');
const path = require('node:path');
const bufferToStream = require('./GcpTtsProvider/bufferToStream.js');
const getKeyByValue = require('./GcpTtsProvider/getKeybyValue.js');
const GcpTtsParamBuilder = require('./GcpTtsProvider/ParameterBuilder.js');
const localeMap = require('./GcpTtsProvider/locale.json');
const TTSProvider = require('../TTSProvider.js');
const i18n = require('../../../i18n/main.mod.js');

// Google Cloud Text-to-Speech Engine Class
class GcpTts extends TTSProvider {
    constructor(params) {
        super();
        this._client = new GcpTtsExt.TextToSpeechClient({
            projectId: require('../../../../configs/gcp-credentials.json').project_id,
            keyFilename: path.join(path.dirname(require.main.filename), 'configs/gcp-credentials.json')
        });
        this._request = params;
    }

    // (static) parameter builder for gcp-tts
    static get ParameterBuilder() { return GcpTtsParamBuilder }

    async speak(message, readAuthor = true) {
        // If message author or channel is different or authorId is not system(0), send TTS w/ prefix.
        if (readAuthor) {
            this._request.input = {
                ssml: '<speak><prosody pitch="-3st">' + i18n.get(getKeyByValue(localeMap, this._request.voice.languageCode), 'tts.speak.prefix')
                    .format(message.author.name) + '</prosody><break time="0.5s"/>' + message.content + '</speak>'
            };
        } else {
            this._request.input = { text: message.content };
        }

        console.log(this._request); //debug

        const [response] = await this._client.synthesizeSpeech(this._request);
        // Google sends response as buffer. We need to convert it as ReadableStream.
        const stream = bufferToStream(response.audioContent);
        return stream;
    }
}

module.exports = { GcpTts };