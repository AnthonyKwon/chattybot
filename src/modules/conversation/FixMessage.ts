import { Message } from 'discord.js';
import { getString } from '../i18n/GetString';
import { getCurrentLocale } from '../i18n/GetCurrentLocale';
import {getRelativeTime} from "../i18n/GetDateTime";
//
const skipMark = '󳋖󵐈';

/**
 * Resolve name of the snowflake in the message.
 * @param message Current message.
 * @param data Data object for the message.
 */
function resolveSnowflake(message: string, data: Message): string {
    // regex for know Discord snowflake
    const snowflakeRegex: RegExp = /<(@|@!|#|@&|\/\w*:|a?:\w*:)(\d{17,19})>/g;
    return message.replace(snowflakeRegex, function(_match, prefix: string, snowflake: string): string {
        // return the name of each counterpart
        if (prefix === '@' || prefix === '@!')
            return data.guild?.members.cache.get(snowflake)?.displayName ?? snowflake;
        else if (prefix === '#')
            return data.guild?.channels.cache.get(snowflake)?.name ?? snowflake;
        else if (prefix === '@&')
            return data.guild?.roles.cache.get(snowflake)?.name ?? snowflake;
        else if (prefix.startsWith('/'))
            return data.guild?.commands.cache.get(snowflake)?.name ?? snowflake;
        else if (prefix.startsWith(':') || prefix.startsWith('a:'))
            return data.client?.emojis.cache.get(snowflake)?.name ?? snowflake;

        return message;
    });
}

/**
 * Resolve timestamp in the message to string.
 * @param message Current message.
 * @param data Data object for the message.
 */
function resolveTimestamp(message: string, data: Message): string {
    const timestampRegex: RegExp = /<t:(\d+)(:[DdFfRTt])?>/g;
    return message.replace(timestampRegex, function(_match, timestamp: string, printFormat: string): string {
        const date = new Date(Number.parseInt(timestamp) * 1000);
        if (printFormat === ':t')
            return date.toLocaleTimeString(getCurrentLocale(data), { hour: "numeric", minute: "numeric", second: undefined });
        else if (printFormat === ':T')
            return date.toLocaleTimeString(getCurrentLocale(data), { hour: "numeric", minute: "numeric", second: "numeric" });
        else if (printFormat === ':d')
            return date.toLocaleDateString(getCurrentLocale(data), { year: "numeric", month: "numeric", day: "numeric" });
        else if (printFormat === ':D')
            return date.toLocaleDateString(getCurrentLocale(data), { year: "numeric", month: "long", day: "numeric" });
        else if (printFormat === ':F')
            return date.toLocaleString(getCurrentLocale(data), { year: "numeric", month: "long", day: "numeric", weekday: "long", hour: "numeric", minute: "numeric", second: undefined });
        else if (printFormat === ':R') {
            const now = new Date();
            const locale = getCurrentLocale(data);

            // ref: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/valueOf
            // get Year differences between now target date
            let diff: number = Math.floor((+now - +date) / 31557600000) * -1;
            if (diff !== 0) return getRelativeTime(locale, diff, 'year');
            // get Month differences
            diff = (now.getUTCMonth() - date.getUTCMonth()) * -1;
            if (Math.floor((+now - +date) / 2548800000) !== 0 &&
                diff !== 0) return getRelativeTime(locale, diff, 'month');
            // get Day differences
            diff = Math.floor((+now - +date) / 86400000) * -1;
            if (diff !== 0) return getRelativeTime(locale, diff, 'day');
            // get Hour differences
            diff = Math.floor((+now - +date) / 3600000) * -1;
            if (diff !== 0) return getRelativeTime(locale, diff, 'hour');
            // get Minute differences
            diff = Math.floor((+now - +date) / 60000) * -1;
            if (diff !== 0) return getRelativeTime(locale, diff, 'minute');
            // get Second differences
            diff = Math.floor((+now - +date) / 1000) * -1;
            return getRelativeTime(locale, diff, 'second');
        }
        else
            return date.toLocaleString(getCurrentLocale(data), { year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "numeric", second: undefined });
    });
}

/**
 * Replace link to dummy text.
 * @param message Current Message.
 * @param data Data object for the Message.
 */
function removeURI(message: string, data: Message): string {
    const uriRegex: RegExp = /(https?|ftp|mailto|file|data|irc):\/?\/?((?:[\w]+(?:\:[\w]+)?@)?(?:[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*|\[[A-Fa-f0-9:]+\]))(:[\d]{1,5})?(\/[a-zA-Z0-9\.~!*'();:@=+$,\/%#\[\]-]*)?(\?[\w\.~!*'();:@&=+$,?%\[\]-]*)?(#[\w\.~!*'();:@&=+$,?%#\[\]-]*)?/g;
    return message.replace(uriRegex, `${skipMark}(${getString(getCurrentLocale(data), 'message.fix.link')})${skipMark}`);
}

function removeSpecialChar(message: string): string {
    const specialRegex: RegExp = /[{\}\[\]\/:|\)*`^_<>@\#\\\=\(]/g;

    // remove special character from message (excluding skipping area)
    let messageArray: string[] = message.split(skipMark);
    for (let i = 0; i < messageArray.length; i+=2) {
       messageArray[i] = messageArray[i].replace(specialRegex, '');
    }

    return messageArray.join('');
}

export function fixMessage(data: Message): string {
    let newMessage: string = data.content;

    // replace unintended specialAlt to whitespace from current message
    newMessage.replace(skipMark, ' ');

    // resolve snowflake in current message
     newMessage = resolveSnowflake(newMessage, data);

    // resolve timestamp from current message
    newMessage = resolveTimestamp(newMessage, data);

    // replace link to dummy text
    newMessage = removeURI(newMessage, data);

    // remove special characters from message
    newMessage = removeSpecialChar(newMessage);

    // return the corrected message
    return newMessage;
}