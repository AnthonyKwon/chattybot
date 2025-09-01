import {
    BaseChannel,
    CategoryChannel,
    ForumChannel,
    Guild,
    GuildMember,
    MediaChannel,
    NewsChannel,
    StageChannel,
    TextChannel,
    ThreadChannel,
    User,
    VoiceChannel
} from 'discord.js';

/**
 * Parse actual name from snowflake data.
 * @param data - {@link Guild}, {@link BaseChannel}, or {@link User} object to parse.
 * @beta
 * @todo Find out how to parse timestamp.
 */
export function getName(data: Guild |
    TextChannel | VoiceChannel | CategoryChannel | NewsChannel |
    StageChannel | ForumChannel | MediaChannel | ThreadChannel |
    GuildMember | User): string {
    if (data instanceof GuildMember || data instanceof User)
        return data.displayName;  // GuildMember and User have "displayName" property
    else
        return data.name;  // GuildChannel, ThreadChannel and Guild have "name" property
}