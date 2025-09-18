import {resolve} from 'path';
import {
    AttachmentBuilder,
    ChannelType,
    ChatInputCommandInteraction,
    GuildMember,
    GuildTextBasedChannel,
    Locale,
    MessageFlags,
    PermissionsBitField,
    VoiceBasedChannel
} from 'discord.js';
import {generate} from 'random-words';
import {getString} from '../modules/i18n/GetString';
import config from '../modules/config/ConfigLoader';
import logger from '../modules/log/Logger';
import {createReport} from '../modules/log/report/Report';
import {ConversationManager} from '../modules/conversation/Conversation';
import {ThreadOptions} from '../modules/discord/thread/Thread';
import I18nCommandBuilder from '../modules/discord/command/I18nCommandBuilder';
import I18nChannelOption from '../modules/discord/command/option/I18nChannelOption';
import {getCurrentLocale} from '../modules/i18n/GetCurrentLocale';
import {resolveTimestamp} from '../modules/conversation/FixMessage';
import {ICommand} from "../modules/discord/command/ICommand";

// channel verification: lots of checks before joining to voice channel
function verify(voiceChannel: VoiceBasedChannel | undefined, textChannel: GuildTextBasedChannel | null): asserts voiceChannel is VoiceBasedChannel {
    // fail when voice channel is not available
    if (!voiceChannel)
        throw new Error('invalidVoiceChannel');

    // fail when text channel is unknown or not a valid type
    if (!textChannel || textChannel.type !== ChannelType.GuildText)
        throw new Error('invalidTextChannel');

    // fail when bot have not enough permission to voice channel (Connect, Speak)
    let permissions = voiceChannel.permissionsFor(voiceChannel.client.user);
    const voicePermissions = new PermissionsBitField(3_145_728n);
    if (!voiceChannel.joinable || !permissions || !permissions.has(voicePermissions))
        throw new Error ('botNoPermission');

    // failed when bot not enough permissions to text channel (Create Public Threads, Manage Threads)
    permissions = textChannel.permissionsFor(textChannel.client.user);
    const textPermissions = new PermissionsBitField(51_539_607_552n);
    if (!permissions || !permissions.has(textPermissions))
        throw new Error('botNoPermission');

    // get currently joined voice channel (if has one) 
    const voice = require('@discordjs/voice');
    const connection = voice.getVoiceConnection(voiceChannel.guild.id);
    const currChannelId = connection ? connection.joinConfig.channelId : undefined;

    // fail when bot already joined into same channel
    if (currChannelId === voiceChannel.id)
        throw new Error('alreadyJoined');

    // YEP: all checks passed. bot can join to this channel
    return;
}

async function commandHandler(interaction: ChatInputCommandInteraction) {
    const locale: Locale = getCurrentLocale(interaction);
    const member: GuildMember = interaction.member as GuildMember;

    // get voice channel from options
    let channel = interaction.options.getChannel(getString(Locale.EnglishUS, 'command.join.options.0.name')) as VoiceBasedChannel | undefined;

    // fetch user-joined voice channel (when option not available)
    if (!channel && member.voice.channel)
        channel = member.voice.channel;

    // verify the channel first
    try {
        verify(channel, interaction.channel as GuildTextBasedChannel | null);
    } catch (err: any) {
        logger.verbose({ topic: 'discord:command', message: `Ignored channel join request. Reason: ${err.message}` });
        await interaction.editReply(getString(locale, `error.${err.message}`, interaction.channel!.toString()));
        return;
    }

    try {
        // use TTSUser class to parse username properly
        const threadWord = generate({ exactly: 2, maxLength: 7, formatter: (word, index) => index === 0 ? word.slice(0, 1).toUpperCase().concat(word.slice(1)) : word, join: '' });
        const threadDate = resolveTimestamp(`<t:${Math.floor(Date.now() / 1000)}:f>`, await interaction.fetchReply());
        const threadName = `${threadWord} (${threadDate})`;
        const options = new ThreadOptions(threadName, config.discord.archiveDuration, config.cooldown);

        // try to start the conversation
        const conversation = ConversationManager.create(interaction, channel);
        await conversation.start(options);

        // send success reply to user
        logger.verbose({ topic: 'discord:command', message: `Joined voice channel ${channel}.` });
        await interaction.followUp({
            content: getString(interaction.locale, 'message.conversation.joined', channel.toString()),
            flags: MessageFlags.Ephemeral
        });
    } catch (err: any) {
        logger.error({ topic: 'discord:command', message: 'error occurred while joining voice channel!' });
        logger.error({ topic: 'discord:command', message: err.stack });

        // create an error report
        const report = createReport(err, interaction.user.id);

        // exit if error report is not available
        if (!report) return;

        // build interaction to send report
        const errorInteraction = {
            content: getString(interaction.guild!.preferredLocale, 'error.generic', report),
            files: [ (new AttachmentBuilder(resolve(global.appRoot, 'logs/report', report))) ]
        };

        // send error message to discord channel
        await interaction.editReply(errorInteraction);
    }
}

const command: ICommand = {
    data: new I18nCommandBuilder('join')
        .setName()
        .setDescription()
        .addChannelOption(new I18nChannelOption('join', 0)
            .setName()
            .setDescription()
            .addChannelTypes(ChannelType.GuildVoice)
            .addChannelTypes(ChannelType.GuildStageVoice)
            .setRequired(false)),
    execute: commandHandler
}

export default command;