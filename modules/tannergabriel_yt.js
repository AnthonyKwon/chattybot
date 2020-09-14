/*
 * TannerGabriel's youtube-dl discord bot sample.
 * https://github.com/TannerGabriel/discord-bot.git
 */

const ffmpeg = require('fluent-ffmpeg');
const util = require('util');
const ytdl = require('ytdl-core');
const ytpl = require('ytpl');
const { bufferToStream, logger, parseTime } = require('./common');
const string = require('./stringResolver');
const voice = require('./discordAudio');
const ffprobe = util.promisify(ffmpeg.ffprobe);
let timeOffset = 0;

const queue = new Map();

const isPlaying = message => {
    const serverQueue = queue.get(message.guild.id);
    if (voice.isOccupied() && serverQueue) return true;
    else return false;
}

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
        songs: [],
        volume: 5,
        playing: true
    };
    queue.set(message.guild.id, queueConstruct);
    addSong(queueConstruct.songs, song);

    try {
        message.delete();
        play(message, queueConstruct.songs[0]);
    } catch (err) {
        logger.log('error', `[tannergabriel-music] Failed to add to queue and play music: ${err.stack}`);
        queue.delete(message.guild.id);
        return message.channel.send(string.get('addSongFailed').format(song.title));
    }
}

const listQueue = (message, serverQueue, index) => {
    if (!serverQueue || !serverQueue.songs) return message.channel.send(string.get('noSongPlaying'));
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
    message.channel.send(songList.join('\n'));
}

let dispatcher;

const play = async (message, song, quiet=false) => {
    if (voice.isOccupied() && !isPlaying) return;
    const serverQueue = queue.get(message.guild.id);
    if (!song) {
        voice.leave(message);
        queue.delete(message.guild.id);
        logger.log('verbose', '[tannergabriel-music] Stopped player and left from voice channel.');
        return;
    }

    let stream = await seek(ytdl(song.url, { filter: 'audioonly', format: 'webm' }));
    dispatcher = await voice.play(message, stream, { type: 'ogg/opus' });
    logger.log('verbose', `[tannergabriel-music] Now playing ${song.title}...`);
    dispatcher.on('finish', () => {
        logger.log('verbose', '[tannergabriel-music] Finished. Shifting to next song...');
        timeOffset = 0;
        serverQueue.songs.shift();
        play(message, serverQueue.songs[0]);
    }).on('error', err => {
        logger.log('error', `[tannergabriel-music] Failed to play music: ${err.stack}`);
    });
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

const seek = async (stream) => {
    try {
        const result = ffmpeg(stream).seek(parseTime(timeOffset)).format('opus')
            .on('error', (err, stdout, stderr) => {
                throw err;
            })
            .on('stderr', (stderr) => { /* Why fluent-ffmpeg prints stdout to stderr? */
                logger.log('verbose', `[fluent-ffmpeg] FFMPEG output: ${stderr}`);
            });
        return result.pipe();
    } catch (err) {
        logger.log('error', `[fluent-ffmpeg] Failed to encode: ${err.stack}`);
    }
}

const destroy = message => {
    const serverQueue = queue.get(message.guild.id);
    const backupQueue = Object.assign({}, serverQueue);
    const playTime = timeOffset + dispatcher.streamTime;
    stop(message, serverQueue, true);
    dispatcher = undefined;
    return { serverQueue: backupQueue, playTime: playTime };
}

const restore = (message, data) => {
    queue.set(message.guild.id, data.serverQueue);
    timeOffset = data.playTime;
    play(message, data.serverQueue.songs[0], true);
}

const skip = (message, serverQueue) => {
    if (!serverQueue) return message.channel.send(string.get('noSongtoSkip'));
    message.channel.send(string.get('skipCurrentSong').format());

    if (serverQueue.playing !== true) {
        dispatcher.resume();
        serverQueue.playing = true;
    }
    dispatcher.end();
}

const stop = (message, serverQueue, quiet=false) => {
    serverQueue.songs = [];
    if(!quiet) message.channel.send(string.get('stopPlayer'));
    if (serverQueue.playing !== true) {
        dispatcher.resume();
        serverQueue.playing = true;
    }
    dispatcher.end();
}

module.exports = {
    isPlaying,
    queue,
    addQueue,
    listQueue,
    play,
    pause,
    skip,
    stop,
    destroy,
    restore
}

