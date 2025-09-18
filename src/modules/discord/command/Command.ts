import path from 'node:path';
import fs from 'node:fs';
import {resolve} from 'path';
import {AttachmentBuilder, Collection, CommandInteraction, InteractionReplyOptions, MessageFlags} from 'discord.js';
import logger from '../../log/Logger';
import {createReport} from '../../log/report/Report';
import {getString} from '../../i18n/GetString';
import {ICommand} from './ICommand';

const cache: Collection<string, ICommand> = new Collection();

/** Load commands to client. */
export async function load(): Promise<void> {
    // directory for command files
    const fileDir: string = path.join(globalThis.appRoot, 'build', 'commands');
    // array of command files name
    const files: string[] = fs.readdirSync(fileDir).filter(file => file.endsWith('.js'));

    // import all commands in directory
    for (const file of files) {
        const fullPath: string = path.join(fileDir, file);
        const command: ICommand = (await import(fullPath)).default.default;

        // save currently loaded command into cache
        cache.set(command.data.name, command);
        logger.verbose({ topic: 'discord.command', message: `Command "${command.data.name}" loaded.` });
    }
}

/**
 * Handle command interaction from client.
 * @param interaction - Interaction to handle.
 */
export async function handle(interaction: CommandInteraction): Promise<void> {
    logger.verbose({ topic: 'discord.command', message: `Interaction received.` });

    // retrieve command from cache
    const command: ICommand | undefined = cache.get(interaction.commandName);

    // show error on command not exist
    if (!command) {
        logger.error({ topic: 'Discord', message: `No command matching ${interaction.commandName} was found.` });
        return;
    }

    // alert user about this bot is guild-only
    if (!interaction.guild || !interaction.inGuild()) {
        logger.verbose({ topic: 'discord.command', message: `Interaction came from outside of guild, ignoring.` });
        await interaction.reply(getString(interaction.locale, 'error.discord.guild_only'));
        return;
    }

    try {
        // mark interaction as ephemeral decided by extra data
        const flags = command.ephemeral ? MessageFlags.Ephemeral : undefined;
        await interaction.deferReply({flags: flags});

        // launch command action
        await command.execute(interaction);
    } catch(err: any) {
        logger.error({ topic: 'discord.command', message: `Error occurred while handling command!` });
        logger.error({ topic: 'discord.command', message: err.stack ? err.stack : err });

        // create an error report
        const report = createReport(err, interaction.user.id);

        // exit if error report is not available
        if (!report) return;

        // build interaction to send report
        const errorInteraction: InteractionReplyOptions = {
            content: getString(interaction.locale, 'error.generic', report),
            files: [ (new AttachmentBuilder(resolve(global.appRoot, 'logs/report', report))) ],
            flags: MessageFlags.Ephemeral
        };

        // send report interaction
        if (interaction.replied || interaction.deferred)
            await interaction.followUp(errorInteraction);
        else
            await interaction.reply(errorInteraction);
    }
}