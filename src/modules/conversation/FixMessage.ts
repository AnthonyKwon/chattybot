import { Message } from "discord.js";
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
 * @todo complete localization
 */
function resolveTimestamp(message: string, data: Message): string {
    const timestampRegex: RegExp = /<t:(\d+)(:[DdFfRTt])?>/g;
    return message.replace(timestampRegex, function(_match, timestamp: string, printFormat: string): string {
        console.log(Number.parseInt(timestamp));
        const date = new Date(Number.parseInt(timestamp) * 1000);
        if (printFormat === ':t')
            return date.toLocaleTimeString(data.guild?.preferredLocale, { hour: "numeric", minute: "numeric", second: undefined });
        else if (printFormat === ':T')
            return date.toLocaleTimeString(data.guild?.preferredLocale, { hour: "numeric", minute: "numeric", second: "numeric" });
        else if (printFormat === ':d')
            return date.toLocaleDateString(data.guild?.preferredLocale, { year: "numeric", month: "numeric", day: "numeric" });
        else if (printFormat === ':D')
            return date.toLocaleDateString(data.guild?.preferredLocale, { year: "numeric", month: "long", day: "numeric" });
        else if (printFormat === ':F')
            return date.toLocaleString(data.guild?.preferredLocale, { year: "numeric", month: "long", day: "numeric", weekday: "long", hour: "numeric", minute: "numeric", second: undefined });
        else if (printFormat === ':R') {
            // get time difference between current and target time
            const now = new Date();
            let diff = now.valueOf() - date.valueOf();
            const diffMonth = now.getUTCMonth() - date.getUTCMonth();
            const diffYear = now.getUTCFullYear() - date.getUTCFullYear();
            // second
            diff = Math.floor(diff / 1000);
            if (diff > -60 && diff < 60) return `${diff} 초 전`;
            // minute
            diff = Math.floor(diff / 60);
            if (diff > -60 && diff < 60) return `${diff} 분 전`;
            // hour
            diff = Math.floor(diff / 60);
            if (diff > -24 && diff < 24) return `${diff} 시간 전`;
            // day
            if (diffMonth === 0 && diffYear === 0) return `${Math.floor(diff / 24)} 일 전`;
            // month
            if (diffYear === 0) return `${diffMonth} 개월 전`;
            // year
            return `${diffYear} 년 전`;
        }
        else
            return date.toLocaleString(data.guild?.preferredLocale, { year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "numeric", second: undefined });
    });
}

/**
 * Replace link to dummy text.
 * @param message Current Message.
 * @todo complete localization
 */
function removeURI(message: string): string {
    const uriRegex: RegExp = /(https?|ftp|mailto|file|data|irc):\/?\/?((?:[\w]+(?:\:[\w]+)?@)?(?:[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*|\[[A-Fa-f0-9:]+\]))(:[\d]{1,5})?(\/[a-zA-Z0-9\.~!*'();:@=+$,\/%#\[\]-]*)?(\?[\w\.~!*'();:@&=+$,?%\[\]-]*)?(#[\w\.~!*'();:@&=+$,?%#\[\]-]*)?/g;
    return message.replace(uriRegex, `${skipMark}(링크)${skipMark}`);
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
    newMessage = removeURI(newMessage);

    // remove special characters from message
    newMessage = removeSpecialChar(newMessage);

    // return the corrected message
    return newMessage;
}