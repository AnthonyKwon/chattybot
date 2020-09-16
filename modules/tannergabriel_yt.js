/* TannerGabriel's youtube-dl discord bot sample.
 * https://github.com/TannerGabriel/discord-bot.git */
const ffmpeg = require('fluent-ffmpeg');
const ytdl = require('ytdl-core');
const ytpl = require('ytpl');
const { logger, parseTime } = require('./common');
const string = require('./stringResolver');
const voice = require('./discordAudio');
let timeOffset = 0;

const queue = new Map();
const stream = new Map();

/* Check if music player is playing */
const isPlaying = message => {
    const serverQueue = queue.get(message.guild.id);
    if (voice.isOccupied(message.guild.id) && serverQueue) return true;
    else return false;
}

const addSong = (songList, songToAdd) => {
    const song = songList;
    /* If song list is array */
    if (Array.isArray(songToAdd)) {
        /* combine current queue array and new songlist array */
        songToAdd.forEach(s => {
            song.push(s);
        });
    } else {
        /* Put passed object to queue array */
        song.push(songToAdd);
    }
    return song;
}

const addQueue = async (message, serverQueue, skip=false) => {
    const args = message.content.split(" ");
    let song = [], songTitle;

    /* If voice connection is occupied (not by music player), return error */
    if (voice.isOccupied(message.guild.id) && !isPlaying(message)) return message.channel.send('voiceConnectionOccupied');
    /* resolve leave -> play conflict */
    if (!skip && !voice.isConnected(message.guild.id) && (serverQueue && serverQueue.songs)) return addQueue(message, undefined, true);
    /* If link is playlist */
    if (args[1].includes('list=')) {
        /* Validate youtube playlist link */
        if (!await ytpl.validateID(args[1])) return message.channel.send(string.get('invalidLink'));
        const result = await ytpl(args[1]);
        result.items.forEach(i => {
            /* push data to song list (song list will be array) */
            const data = {
                title: i.title,
                url: i.url
            };
            song.push(data);
        });
        /* Set title as 1st song name and playlist count (ex: Next to Me and 11 more song(s) added to queue.) */
        songTitle = string.get('playlistTitle').format(song[0].title, song.length - 1);
    } else {
        /* Validate youtube video link */
        if (!ytdl.validateURL(args[1])) return message.channel.send(string.get('invalidLink'));
        const songInfo = await ytdl.getInfo(args[1]);
        /* set data to song list (song list will be object) */
        song = {
            title: songInfo.videoDetails.title,
            url: songInfo.videoDetails.video_url
        };
        /* Set title as 1st song name (ex: Next to Me added to queue.) */
        songTitle = song.title;
    }

    /* If serverQueue is not null == music is already playing */
    if (serverQueue) {
        /* Add music to current queue */
        addSong(serverQueue.songs, song);
        message.delete();
        return message.channel.send(string.get('addSongSucess').format(songTitle));
    }

    /* Queue */
    const queueConstruct = {
        textChannel: message.channel,
        songs: [],
        volume: 5,
        playing: true
    };
    /* Set queue by message author's guild */
    queue.set(message.guild.id, queueConstruct);
    /* Add song to queue and play music */
    addSong(queueConstruct.songs, song);

    try {
        message.delete();
        play(message, queueConstruct.songs[0]);
    } catch (err) {
        logger.log('error', `[tannergabriel-music] Failed to add to queue and play music: ${err.stack}`);
        queue.delete(message.guild.id);
        return message.channel.send(string.get('addSongFailed').format(songTitle));
    }
}

const listQueue = (message, serverQueue, index) => {
    /* If playlist empty, return error */
    if (!serverQueue || !serverQueue.songs) return message.channel.send(string.get('noSongPlaying'));
    const songList = [];
    const indexN = index >= 1 && index <= Math.ceil(serverQueue.songs.length/7) ? index : 1; /* Convert index to correct value */
    /* Show playlist as 7 line */
    for (let i = (indexN-1)*7; i < (indexN * 7); i++) {
        /* If no more song exists, break out */
        if (!serverQueue.songs[i]) break;
        if (i === 0) {
            /* Show first song as Now playing */
            songList.push(string.get('songQueueIndex1Current').format(serverQueue.songs[i].title));
        } else {
            songList.push(string.get('songQueueIndex1').format(i, serverQueue.songs[i].title));
        }
    }
    /* Playlist index */
    songList.push(string.get('songQueueIndex2').format(indexN, Math.ceil(serverQueue.songs.length/7)));
    message.channel.send(songList.join('\n'));
}

/* TODO: dispatcher variable is global and only accepts one guild data.
 * This might cause problem later. */
let dispatcher;

const play = async (message, song, quiet=false) => {
    const serverQueue = queue.get(message.guild.id);
    if (!song) {
        /* Dirty trial to resolve FFmpeg memory leak */
        /* TODO: leave voice channel (only when song play queue reached end) */
        if (stream.get(message.guild.id)) {
            await stream.get(message.guild.id).kill();
            stream.delete(message.guild.id);
        }
        queue.delete(message.guild.id);
        logger.log('verbose', '[tannergabriel-music] Stopped player and left from voice channel.');
        return;
    }

    /* Pipe stream from ytdl to ffmpeg and save to guild's stream */
    stream.set(message.guild.id, await seek(ytdl(song.url, { filter: 'audioonly', format: 'webm' })));
    /* Send stream to voice channel */
    dispatcher = await voice.play(message, stream.get(message.guild.id).pipe(), { type: 'ogg/opus' });
    logger.log('verbose', `[tannergabriel-music] Now playing ${song.title}...`);
    dispatcher.on('finish', () => {
        /* Play next song on finish */
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
    /* If dispatcher is not running (no song playing), show error. */
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

const seek = async (serverStream) => {
    try {
        /* TODO: find the way to seek without ffmpeg
         *(encoding lossy format again might degrade the audio quality severely) */
        const result = ffmpeg(serverStream).seek(parseTime(timeOffset)).format('opus')
            .on('error', (err, stdout, stderr) => {
                throw err;
            })
            .on('stderr', stderr => { /* Why fluent-ffmpeg prints stdout to stderr? */
                logger.log('verbose', `[fluent-ffmpeg] FFMPEG output: ${stderr}`);
            });
        return result;
    } catch (err) {
        logger.log('error', `[fluent-ffmpeg] Failed to encode: ${err.stack}`);
    }
}

/* Resolve conflict between TTS and Music Player
 * Destroy current music player and return queue/playtime data */
const destroy = message => {
    const serverQueue = queue.get(message.guild.id);
    const backupQueue = Object.assign({}, serverQueue);
    const playTime = timeOffset + dispatcher.streamTime;
    stop(message, serverQueue, true);
    return { serverQueue: backupQueue, playTime: playTime };
}

/* Resolve conflict between TTS and Music Player
 * Restore music player with passed queue/playtime data */
const restore = (message, data) => {
    queue.set(message.guild.id, data.serverQueue);
    timeOffset = data.playTime;
    play(message, data.serverQueue.songs[0], true);
}

const skip = (message, serverQueue) => {
    /* If guild's queue isn't exist, return an error. */
    if (!serverQueue) return message.channel.send(string.get('noSongtoSkip'));
    message.channel.send(string.get('skipCurrentSong').format(serverQueue.songs[0].title));

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
