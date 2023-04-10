export interface TTSMessage {
    author: number,    // message author information
    message: string                          // content of the message
}

export interface ProviderDefInterface {
    keyfile?: string,  // path of the API authentication key file (if neccesary)
    ssml: boolean,     // ssml support
    neural: boolean,
    gain: boolean,     // volume gain support
    pitch: boolean,    // pitch changing support
    speed: boolean     // speed changing support
}

export interface ProviderParams {
    keyfile?: string      // path of the API authentication key file (if neccesary)
    locale: string,       // locale for the provider to use
    gender?: string,      // gender of the synthesized voice
    useNeural?: boolean,  // use neural network based speech synthesize
    useSsml?: boolean     // use ssml, should always return true if service has it
}