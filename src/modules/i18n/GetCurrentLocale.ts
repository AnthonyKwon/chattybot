import { Locale } from 'discord.js';
import config from '../config/ConfigLoader';

export function getCurrentLocale(data: any) {
    return data.guild?.preferredLocale ?? config.defaultLocale;
}

export function getDiscordLocale(value: string): Locale {
    const localeKey: string | undefined = Object.keys(Locale).find(l => Locale[l as keyof typeof Locale] === value);
    return Locale[localeKey as keyof typeof Locale ?? 'EnglishUS'];
}