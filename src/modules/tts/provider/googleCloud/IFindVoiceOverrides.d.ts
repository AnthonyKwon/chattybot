import { IMappedLocale } from "../../../i18n/IMappedLocale";

export interface IFindVoiceOverrides {
    locale: IMappedLocale,
    gender: string,
    variant?: string
}