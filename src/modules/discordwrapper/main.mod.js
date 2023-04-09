import { Client, Events, GatewayIntentBits } from 'discord.js';
import config from '@modules/config';
import logger from '@modules/logger/main.mod';
import i18n from '@modules/i18n/main.mod';
import slash from './slashCommand.js';

const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
]});

client.once(Events.ClientReady, c => {
    // create voice session map
    logger.info('discord.js', `Connected to ${client.user.username}!`);
    c.voice.session = new Map();
    c.user.setActivity(' — /help');

    // register slash commands
    logger.info('discord.js', 'Reloading slash commands...');
    slash.register(config.token, c);

    // load registered slash commands
    slash.load(c);

    //
    c.guilds.cache.forEach(guild => {
        guild.i18n = new i18n.GuildI18n(guild.id);
    });
});

client.on(Events.InteractionCreate, interaction => {
    if (!interaction.isChatInputCommand()) return; // filter only for chat interaction
    slash.handler(interaction);
});

export async function init() {
    await client.login(config.token);
}

module.exports = { 
    init
};
