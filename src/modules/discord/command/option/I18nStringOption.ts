import {Locale, SlashCommandStringOption} from 'discord.js';
import { getString, getAllString } from "../../../i18n/GetString";

export default class I18nStringOption extends SlashCommandStringOption {
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
        const name: string = getString(Locale.EnglishUS, `command.${this.i18nTag}.options.${this.i18nIndex}.name`);
        const nameI18n = getAllString(`command.${this.i18nTag}.options.${this.i18nIndex}.name`);

        // register to builder
        return super.setName(name)
            .setNameLocalizations(nameI18n);
    }

    /** Sets the description of this command. */
    setDescription(): this {
        // get description and it's localization variant
        const description: string = getString(Locale.EnglishUS, `command.${this.i18nTag}.options.${this.i18nIndex}.description`);
        const descI18n = getAllString(`command.${this.i18nTag}.options.${this.i18nIndex}.description`);

        // register to builder
        return super.setDescription(description)
            .setDescriptionLocalizations(descI18n);
    }
}