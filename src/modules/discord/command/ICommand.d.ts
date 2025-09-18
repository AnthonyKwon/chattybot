import { SlashCommandBuilder, SlashCommandOptionsOnlyBuilder } from 'discord.js';

export interface ICommand {
    data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder,
    ephemeral?: boolean,
    execute: Function
}