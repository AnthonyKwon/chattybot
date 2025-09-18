import {GuildMember} from "discord.js";

export interface IQueueableSpeech {
    author: GuildMember;
    text: string;
}