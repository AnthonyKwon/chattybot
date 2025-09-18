import { SlashCommandBuilder } from 'discord.js';
import { getString, getAllString } from '../../i18n/GetString';

/**
 * This also sets localizations automatically.
 * @inheritDoc
 */
export default class I18nCommandBuilder extends SlashCommandBuilder {
    /** I18n tag of this command. */
    public readonly i18nTag: string;

    /**
     * @inheritDoc
     * @param tag I18n tag of this command.
     */
    constructor(tag: string) {
        super();
        this.i18nTag = tag;
    }

    /** Sets the name of this command. */
    setName(): this {
        // get name and it's localization variant
        let name: string = getString('en-US', `command.${this.i18nTag}.name`);
        let nameI18n = getAllString(`command.${this.i18nTag}.name`);

        // prepend "zz" on dev mode
        if (global.devMode) {
            name = `zz${name}`;
            Object.keys(nameI18n).forEach(i => nameI18n[i] = `zz${nameI18n[i as keyof typeof nameI18n]}`);
        }

        // register to builder
        return super.setName(name)
            .setNameLocalizations(nameI18n);
    }

    /** Sets the description of this command. */
    setDescription(): this {
        // get description and it's localization variant
        let description: string = getString('en-US', `command.${this.i18nTag}.description`);
        let descI18n = getAllString(`command.${this.i18nTag}.description`);

        // register to builder
        return super.setDescription(description)
            .setDescriptionLocalizations(descI18n);
    }
}