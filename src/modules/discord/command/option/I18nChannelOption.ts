import { SlashCommandChannelOption } from 'discord.js';
import * as i18n from "../../../i18n/main.mod";

export default class I18nChannelOption extends SlashCommandChannelOption {
    /** I18n tag of this option. */
    public readonly i18nTag: string;
    /** I18n index of this option. */
    public readonly i18nIndex: number;

    /** @inheritDoc */
    constructor(tag: string, index: number) {
        super();
        this.i18nTag = tag;
        this.i18nIndex = index;
    }

    /** Sets the name of this command. */
    setName(): this {
        // get name and it's localization variant
        const name: string = i18n.get('en-US', `command.${this.i18nTag}.opt${this.i18nIndex}.name`);
        const nameI18n = i18n.getAll(`command.${this.i18nTag}.opt${this.i18nIndex}.name`);

        // register to builder
        return super.setName(name)
            .setNameLocalizations(nameI18n);
    }

    /** Sets the description of this command. */
    setDescription(): this {
        // get description and it's localization variant
        const description: string = i18n.get('en-US', `command.${this.i18nTag}.opt${this.i18nIndex}.desc`);
        const descI18n = i18n.getAll(`command.${this.i18nTag}.opt${this.i18nIndex}.desc`);

        // register to builder
        return super.setDescription(description)
            .setDescriptionLocalizations(descI18n);
    }
}