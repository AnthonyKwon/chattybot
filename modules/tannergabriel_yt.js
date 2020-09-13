/*
 * TannerGabriel's youtube-dl discord bot sample.
 * https://github.com/TannerGabriel/discord-bot.git
 */

const ytdl = require('ytdl-core');
const ytpl = require('ytpl');
const { getYtConnection, setYtConnection, logger } = require('./common');
const string = require('./stringResolver');

const queue = new Map();

const addSong = (songList, songToAdd) => {
    const song = songList;
    if (Array.isArray(songToAdd)) {
        songToAdd.forEach(s => {
            song.push(s);
        });
    } else {
        song.push(songToAdd);
    }
    return song;
}

const addQueue = async (message, serverQueue) => {
    const args = message.content.split(" ");

    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.channel.send(string.get('joinVoiceChannelFirst'));
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) return message.channel.send(string.get('noVoiceChannelPermission'));

    let song = [];
    if (args[1].includes('list=')) {
        if (!await ytpl.validateID(args[1])) return message.channel.send(string.get('invalidLink'));
        const result = await ytpl(args[1]);
        result.items.forEach(i => {
            const data = {
                title: i.title,
                url: i.url
            };
            song.push(data);
        });
    } else {
        if (!ytdl.validateURL(args[1])) return message.channel.send(string.get('invalidLink'));
        const songInfo = await ytdl.getInfo(args[1]);
        song = {
            title: songInfo.videoDetails.title,
            url: songInfo.videoDetails.video_url
        };
    }

    if (serverQueue) {
        addSong(serverQueue.songs, song);
        message.delete();
        return message.channel.send(string.get('addSongSucess').format(song.title));
    }

    const queueConstruct = {
        textChannel: message.channel,
        voiceChannel: voiceChannel,
        connection: null,
        songs: [],
        volume: 5,
        playing: true
    };
    queue.set(message.guild.id, queueConstruct);
    addSong(queueConstruct.songs, song);

    try {
        setYtConnection(await voiceChannel.join());
        queueConstruct.connection = getYtConnection();
        message.delete();
        play(message.guild, queueConstruct.songs[0]);
    } catch (err) {
        logger.log('error', `[tannergabriel-music] Failed to add to queue and play music: ${err.stack}`);
        queue.delete(message.guild.id);
        return message.channel.send(string.get('addSongFailed').format(song.title));
    }
}

const listQueue = (message, serverQueue, index) => {
    if (!getYtConnection()) return message.channel.send(string.get('noSongPlaying'));
    const songList = [];
    const indexN = index >= 1 && index <= Math.ceil(serverQueue.songs.length/7) ? index : 1; /* Convert index to correct value */
    for (let i = (indexN-1)*7; i < (indexN * 7); i++) {
        if (!serverQueue.songs[i]) break;
        if (i === 0) {
            songList.push(string.get('songQueueIndex1Current').format(serverQueue.songs[i].title));
        } else {
            songList.push(string.get('songQueueIndex1').format(i, serverQueue.songs[i].title));
        }
    }
    songList.push(string.get('songQueueIndex2').format(indexN, Math.ceil(serverQueue.songs.length/7)));
    console.log(songList);
    message.channel.send(songList.join('\n'));
}

let dispatcher;
const ttsRestoreStreamStage1 = (serverQueue) => {
    const lastPlaytime = serverQueue.connection.dispatcher.streamTime;
    return lastPlaytime;
}
const ttsRestoreStreamStage2 = async (message, serverQueue, lastPlaytime) => {
    play(message.guild, serverQueue.songs[0], lastPlaytime, true);
    if (!serverQueue.playing) dispatcher.pause();
}

const play = (guild, song, lastPlaytime = undefined, quiet = false) => {
    const serverQueue = queue.get(guild.id);
    if (!song) {
        serverQueue.voiceChannel.leave();
        setYtConnection(undefined);
        queue.delete(guild.id);
        return;
    }

    console.log(lastPlaytime);
    if (!lastPlaytime) {
        dispatcher = serverQueue.connection.play(ytdl(song.url))
            .on('finish', () => {
                serverQueue.songs.shift();
            play(guild, serverQueue.songs[0]);
            }).on('error', error => logger.log('error', `[tannergabriel-music] Failed to play music: ${error.stack}`));
    } else {
        dispatcher = serverQueue.connection.play(ytdl(song.url, { begin: `${lastPlaytime}ms` }))
            .on('finish', () => {
                serverQueue.songs.shift();
            play(guild, serverQueue.songs[0]);
            }).on('error', error => logger.log('error', `[tannergabriel-music] Failed to play music: ${error.stack}`));
    }
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
    if (!quiet) serverQueue.textChannel.send(string.get('playSongStart').format(song.title));
}

const pause = (message, serverQueue) => {
    if (!dispatcher) return message.channel.send(string.get('noSongPlaying'));
    if (serverQueue.playing === true) {
        dispatcher.pause();
        serverQueue.playing = false;
        message.channel.send(string.get('songPaused'));
    } else {
        dispatcher.resume();
        serverQueue.playing = true;
        message.channel.send(string.get('songResumed'));
    }
}

const skip = (message, serverQueue) => {
    if (!message.member.voice.channel) return message.channel.send(string.get('joinVoiceChannelFirst'));
    if (!serverQueue) return message.channel.send(string.get('noSongtoSkip'));
    message.channel.send(string.get('skipCurrentSong').format(serverQueue.songs[0].title));
    if (serverQueue.playing !== true) {
        dispatcher.resume();
        serverQueue.playing = true;
    }
    serverQueue.connection.dispatcher.end();
}

const stop = (message, serverQueue) => {
    if (!message.member.voice.channel) return message.channel.send(string.get('joinVoiceChannelFirst'));
    serverQueue.songs = [];
    message.channel.send(string.get('stopPlayer'));
    if (serverQueue.playing !== true) {
        dispatcher.resume();
        serverQueue.playing = true;
    }
    serverQueue.connection.dispatcher.end();
}

module.exports = {
    queue,
    addQueue,
    listQueue,
    ttsRestoreStreamStage1,
    ttsRestoreStreamStage2,
    play,
    pause,
    skip,
    stop
}

