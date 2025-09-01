import { SlashCommandBuilder } from 'discord.js';
import * as i18n from '../../i18n/main.mod';
import { isDevMode } from '../../common';

/**
 * This also sets localizations automatically.
 * @inheritDoc
 * @class
 */
export default class I18nCommandBuilder extends SlashCommandBuilder {
    /** I18n tag of this command. */
    public readonly i18nTag: string;

    /**
     * @inheritDoc
     * @param tag - I18n tag of this command.
     */
    constructor(tag: string) {
        super();
        this.i18nTag = tag;
    }

    /** Sets the name of this command. */
    setName(): this {
        // get name and it's localization variant
        let name: string = i18n.get('en-US', `command.${this.i18nTag}.name`);
        let nameI18n = i18n.getAll(`command.${this.i18nTag}.name`);

        // prepend "zz" on dev mode
        if (isDevMode()) {
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
        let description: string = i18n.get('en-US', `command.${this.i18nTag}.desc`);
        let descI18n = i18n.getAll(`command.${this.i18nTag}.desc`);

        // register to builder
        return super.setDescription(description)
            .setDescriptionLocalizations(descI18n);
    }
}