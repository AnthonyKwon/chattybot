export interface ITTSConfig {
    version: 1,
    gender: 'male' | 'female' | 'neutral',
    pitch: number,
    speed: number,
    volume: number,
    allowSSML: boolean,
    provider: 'GoogleCloud',
    providerOptions?: {
        GoogleCloud?: {
            preferredTypes: string[],
            defaultVariant?: string
        }
    }
}