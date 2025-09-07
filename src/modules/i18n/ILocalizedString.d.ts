interface ILocaleInfo {
    id: string,
    name: string
}

/** Localization for Discord command. */
export interface ILocalizedCommand {
    name: string,
    description: string,
    options?: ILocalizedCommandOption[]
}

/** Localization for Discord command options. */
export interface ILocalizedCommandOption {
    name: string,
    description: string
}

export interface ILocalizedString {
    version: 1,
    li: ILocaleInfo,
    command: {
        empty: ILocalizedCommand,
        info: ILocalizedCommand,
        join: ILocalizedCommand,
        leave: ILocalizedCommand,
        locale: ILocalizedCommand,
        say: ILocalizedCommand
    },
    error: {
        generic: string[],
        discord: {
            guildOnlyBot: string[],
            noPermission: string,
            unknownChannel: string,
        }
        conversation: {
            alreadyJoined: string,
            botNotInVC: string,
            invalidLocale: string,
            localeAlreadySet: string,
            userNotInVC: string
        }
    },
    message: {
        inDevMode: string,
        command: {
            info: string[],
            queueReset: string
        }
        conversation: {
            join: string,
            leave: string
        },
        discord: {
            permissions: {
                ManageGuild: string
            }
        }
        guildOptions: {
            locale: {
                current: string[],
                successfullySet: string,
                failed: string
            }
        }
    },
    tts: {
        prefix: string,
        gender: {
            female: string,
            male: string,
            neutral: string
        },
        speakDeprecated: string
    }
}