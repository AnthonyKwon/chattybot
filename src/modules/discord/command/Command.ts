import path from 'node:path';
import fs from 'node:fs';
import { Collection, CommandInteraction, MessageFlags } from 'discord.js';
import logger from '../../logger/main.mod';
import i18n from '../../i18n/main.mod';
import report from '../../errorreport/main.mod';

const cache: Collection<string, object> = new Collection();

/**
 * Load commands to client.
 */
export async function load(): Promise<void> {
    // directory for command files
    const fileDir: string = path.join(globalThis.srcRoot, 'commands');
    // array of command files name
    const files: string[] = fs.readdirSync(fileDir).filter(file => file.endsWith('.js'));

    // import all commands in directory
    for (const file of files) {
        const fullPath: string = path.join(fileDir, file);
        const command = (await import(fullPath)).default;

        // save currently loaded command into cache
        cache.set(command.data.name, command);
        logger.verbose({ topic: 'discord.command', message: `Command "${command.data.name}" loaded.` });
    }
}

/**
 * Handle command interaction from client.
 * @param interaction - Interaction to handle.
 * @alpha
 */
export async function handle(interaction: CommandInteraction): Promise<void> {
    logger.verbose({ topic: 'discord.command', message: `Interaction received.` });

    // retrieve command from cache
    //TODO: fix this "any" type after completing typescript rewrite
    const command: any = cache.get(interaction.commandName);

    // show error on command not exist
    if (!command) {
        logger.error({ topic: 'Discord', message: `No command matching ${interaction.commandName} was found.` });
        return;
    }

    // alert user about this bot is guild-only
    if (!interaction.inGuild()) {
        logger.verbose({ topic: 'discord.command', message: `Interaction came from outside of guild, ignoring.` });
        await interaction.reply(i18n.get(interaction.locale, 'error.discord.guild_only'));
        return;
    }

    try {
        // mark interaction as ephemeral decided by extra data
        const flags = command.ephemeral ? MessageFlags.Ephemeral : undefined;
        await interaction.deferReply({flags: flags});

        // launch command action
        await command.execute(interaction);
    } catch(err: any) {
        // create error report of current error
        logger.error({ topic: 'discord.command', message: `Error occurred while handling command!` });
        logger.error({ topic: 'discord.command', message: err.stack ? err.stack : err });

        /*
        const errorInteraction = { content: i18n.get(interaction.locale, 'error.generic').format(result), ephemeral: true };
        const result = report(err, interaction.user.id);

        if (interaction.replied || interaction.deferred)
            await interaction.followUp(errorInteraction);
        else
            await interaction.reply(errorInteraction);
         */
    }
}