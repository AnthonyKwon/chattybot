export interface IGeneralConfig {
    version: 1,
    discord: {
        token: string,
        inviteLink: string,
        status?: string,
        archiveDuration?: number
    },
    log?: {
        timeLimit?: number,
        sizeLimit?: number
    },
    defaultLocale: string,
    cooldown?: number,
    inactiveTimeout?: number
}