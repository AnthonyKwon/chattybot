import config from '../config/ConfigLoader';

export function getCurrentLocale(data: any) {
    return data.guild?.preferredLocale ?? config.defaultLocale;
}