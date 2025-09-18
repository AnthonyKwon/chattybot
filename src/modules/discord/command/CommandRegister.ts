import path from 'node:path';
import fs from 'node:fs';
import { REST, Routes } from 'discord.js';
import config from '../../config/ConfigLoader';
import logger from '../../log/Logger';

const fileDir: string = path.join(globalThis.appRoot, 'build', 'commands');
const files: string[] = fs.readdirSync(fileDir).filter(file => file.endsWith('.js'));

/** Register commands to Discord. */
export async function register() {
    const commands = [];

    // import all commands in directory
    for (const file of files) {
        const fullPath: string = path.join(fileDir, file);
        const command = (await import(fullPath)).default.default;

        // add current command to array
        commands.push(command.data.toJSON());
    }

    logger.info({ topic: 'discord.command', message: `Registering ${commands.length} slash commands.` });
    // register commands to Discord
    try {
        // create rest api agent to communicate with Discord
        const rest: REST = new REST({ version: '10' }).setToken(config.discord.token);

        // get id of current user
        const user: any = await rest.get(Routes.user('@me'));
        const userId: string = user.id;
        logger.verbose({ topic: 'discord.command', message: `Registering as ${user.username}. (${userId})` });

        // send register request to Discord
        const data: any = await rest.put(
            Routes.applicationCommands(userId),
            { body: commands }
        );
        logger.info({ topic: 'discord.command', message: `Registered ${data.length} commands.` });
    } catch(err: any) {
        logger.error({ topic: 'discord.command', message: 'error occurred while registering commands!' });
        logger.error({ topic: 'discord.command', message: err.stack ? err.stack : err });
    }
}

/** Unregister commands from Discord. */
export async function unregister() {
    logger.info({ topic: 'discord.command', message: 'Unregistering commands.' });

    try {
        // create rest api agent to communicate with Discord
        const rest = new REST().setToken(config.discord.token);

        // get id of current user
        const user: any = await rest.get(Routes.user('@me'));
        const userId: string = user.id;
        logger.verbose({ topic: 'discord.command', message: `Unregistering as ${user.username}. (${userId})` });

        // send unregister request to Discord
        const data: any = await rest.put(
            Routes.applicationCommands(userId),
            { body: [] }
        );
        logger.info({ topic: 'discord.command', message: 'Unregistered commands.' });
    } catch(err: any) {
        logger.error({ topic: 'discord.command', message: 'error occurred while unregistering commands!' });
        logger.error({ topic: 'discord.command', message: err.stack ? err.stack : err });
    }
}