const GcpTts = require('./GcpTtsProvider/GcpTts.js');

// (function) get locale mapping from file
const getLocaleMapping = () => require('./GcpTtsProvider/locale.json');

class GcpTtsBasic extends GcpTts {
    constructor(params) {
        super('Standard', '1.0', '0.0', '0.0');
    }
}
class GcpTtsWaveNet extends GcpTts {
    constructor(params) {
        super('Wavenet', '1.0', '0.0', '0.0');
    }
}

module.exports = {
    GcpTtsBasic, GcpTtsWaveNet,
    ParameterBuilder: require('./GcpTtsProvider/ParameterBuilder.js'),
    locales: getLocaleMapping()
}
