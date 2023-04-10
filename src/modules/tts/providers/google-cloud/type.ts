import { RequireOnlyOne } from "@modules/util/types";

interface RequestBodyInputFrame {
    text?: string,
    ssml?: string,
}
export interface RequestBody {
    input: RequireOnlyOne<RequestBodyInputFrame, 'text' | 'ssml'>;
    voice: {
        languageCode: string,
        name?: string,
        ssmlGender: string
    },
    audioConfig: {
        audioEncoding: string,
        speakingRate?: number,
        pitch?: number,
        volumeGainDb?: number
    }
}

export interface ClientParams {
    projectId: string,
    keyFilename: string
}