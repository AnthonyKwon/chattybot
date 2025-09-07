import { IMappedLocale } from "../IMappedLocale";

export interface IFindVoiceOverrides {
    locale: IMappedLocale,
    gender: string,
    variant?: string
}