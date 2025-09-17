export interface IGeneralConfig {
    version: 1,
    discord: {
        token: string,
        inviteLink: string,
        status?: string
    },
    log: {
        timeLimit: number,
        sizeLimit: number
    },
    defaultLocale: string,
    inactiveTimeout: number
}