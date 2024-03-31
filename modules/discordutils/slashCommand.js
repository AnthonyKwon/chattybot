const { Collection, REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const logger = require('../logger/main.mod.js');
const i18n = require('../i18n/main.mod.js');

const commandsPath = path.join(path.dirname(require.main.filename), 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// load slash commands
function SlashCommandLoader(client) {
    if (!client.commands) client.commands = new Collection();

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        // Set a new item in the Collection with the key as the command name and the value as the exported module
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            logger.warn('discord.js', `The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

// register slash command
async function SlashCommandRegister(token, client) {
    const commandList = [];
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);

        // prepend "zz" to command when running as development environment
        if (process.env.NODE_ENV === 'development') {
            command.data.name = `zz${command.data.name}`;
            Object.keys(command.data.name_localizations).forEach(key => command.data.name_localizations[key] = `zz${command.data.name_localizations[key]}`);
        }

        commandList.push(command.data.toJSON());
    }

    const rest = new REST({ version: '10' }).setToken(token);

    // and deploy your commands!
    try {
        logger.info('discord.js:slash', `Started registering/refreshing ${commandList.length} slash commands.`);

        // The put method is used to fully refresh all commands in the guild with the current set
        const data = await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commandList }
        );

        logger.info('discord.js:slash', `Successfully registered/refreshed ${data.length} slash commands.`);
    } catch (err) {
        // And of course, make sure you catch and log any errors!
        logger.error('discord.js:slash', 'Error occured while registering/refreshing slash commands!');
        logger.error('discord.js:slash', err.stack ? err.stack : err);
    }
    process.exit();
}

// unregister slash command
async function SlashCommandUnregister(token, client) {
    const rest = new REST().setToken(token);
    try {
        logger.info('discord.js:slash', 'Started unregistering slash commands.');

        // unregister global slash commands
        await rest.put(Routes.applicationCommands(client.user.id), { body: [] });

        logger.info('discord.js:slash', 'Successfully unregistered slash commands.');
    } catch (err) {
        logger.error('discord.js:slash', 'Error occured while unregistering slash commands!');
        logger.error('discord.js:slash', err.stack ? err.stack : err);
    }
    process.exit();
}

// handle slash commands
async function SlashCommandHandler(interaction) {
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        logger.error('discord.js', `No command matching ${interaction.commandName} was found.`);
        return;
    }

    // prevent non-guild command to be responded
    if (!interaction.inGuild()) {
        await interaction.reply(i18n.get(interaction.locale, 'error.discord.guild_only'));
        return;
    }

    try {
        // defer reply and wait for command to write any message
        const isEphemeral = (command.extra && command.extra.ephemeral) || false;
        await interaction.deferReply({ ephemeral: isEphemeral });
        // launch command
        await command.execute(interaction);
    } catch (err) {
        logger.error('discord.js:slash', `Error occured while handling slash command!`);
        logger.error('discord.js:slash', err.stack ? err.stack : err)

        const errorInteraction = { content: i18n.get(interaction.locale, 'error.generic').format(result), ephemeral: true };
        const result = report(err, interaction.user.id);

        if (interaction.replied || interaction.deferred)
            await interaction.followUp(errorInteraction);
        else
            await interaction.reply(errorInteraction);
    }
}

module.exports = {
    load: SlashCommandLoader,
    handler: SlashCommandHandler,
    register: SlashCommandRegister,
    unregister: SlashCommandUnregister
};