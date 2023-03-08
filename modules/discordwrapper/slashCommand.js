const { Collection, REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const logger = require(path.join(path.dirname(require.main.filename), 'modules', 'logger', 'main.mod.js'));

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
function SlashCommandRegister(token, client) {
    const commandList = [];
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        commandList.push(command.data.toJSON());
    }

    const rest = new REST({ version: '10' }).setToken(token);

    // and deploy your commands!
    (async () => {
        try {
            logger.verbose('discord.js', `Started refreshing ${commandList.length} application (/) commands.`);

            // The put method is used to fully refresh all commands in the guild with the current set
            const data = await rest.put(
                Routes.applicationCommands(client.user.id),
                { body: commandList },
            );

            logger.verbose('discord.js', `Successfully reloaded ${data.length} application (/) commands.`);
        } catch (error) {
            // And of course, make sure you catch and log any errors!
            logger.error('discord.js', error);
        }
    })();
}

// handle slash commands
async function SlashCommandHandler(interaction) {
    const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		logger.error('discord.js', `No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
        // defer reply and wait for command to write any message
        await interaction.deferReply({ ephemeral: command.extra.ephemeral || false });
        // launch command
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
}

module.exports = { load: SlashCommandLoader, handler: SlashCommandHandler, register: SlashCommandRegister };