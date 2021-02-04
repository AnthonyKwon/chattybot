const fs = require('fs');
const { once } = require('events');
const ffmpeg = require('fluent-ffmpeg');
const ytdl = require('ytdl-core');
const common = require('./common.js');
const discord = require('./discord.js');

function test(args) {
    return ytdl(args);
}

class PlayerClass {
    constructor() {
        if (arguments.length === 0)
            this._queue = [];
        else if (arguments.length === 1) 
            this._queue = arguments[0];
        this._ffmpeg = undefined;
        this._playing = false;
    }

    async getInfo(input) {
        const info = await ytdl.getBasicInfo(input);
        return info.videoDetails.title;
    }

    get playState() {
        return this._playing;
    }
    toggleState(voice) {
        if (this._playing) {
            voice.dispatcher.pause();
            this._playing = false;
        } else {
            voice.dispatcher.resume();
            this._playing = true;
        }
        return this._playing;
    }

    getPlaytime(voice) {
        if (voice.dispatcher) return voice.dispatcher.streamTime;
        else return 0;
    }

    get queue() {
        return this._queue;
    }
    set queue(url) {
        this._queue.push(url);
    }

    get stream() {
        return this._stream;
    }

    validate(input) {
        return (ytdl.validateID(input) || ytdl.validateURL(input));
    }

    async ffmpeg_process(stream, offset) {
        /* TODO: Find the way to write log at file */
        const result = ffmpeg(stream).seek(common.parseTime(offset)).format('opus')
            .audioBitrate(160).audioFilters('loudnorm', 'volume=0.8').outputOption('-strict -2')
            .on('error', (err, stdout, stderr) => {
                if (err.message === "ffmpeg was killed with signal SIGKILL") return;
                //console.log(`[fluent-ffmpeg] Failed to encode: ${err.stack}`);
            })
            .on('stderr', stderr => { /* Why fluent-ffmpeg prints stdout to stderr? */
                console.log(`[fluent-ffmpeg] FFMPEG output: ${stderr}`);
            });
        return result;
    }

    async play(voice, resume=0) {
        this._playing = true;
        while (this._queue.length > 0) {
            this._ffmpeg = await this.ffmpeg_process(ytdl(this._queue[0], { filter: 'audioonly' }), resume);
            const result = voice.play(this._ffmpeg.pipe());
            /* await until voice.play finishes (https://stackoverflow.com/a/43084615) */
            await once(result, 'finish');
            this._queue.shift();
        }
        this._playing = false;
        return;
    }

    async seek(voice, inputTime) {
        const videoInfo = await ytdl.getBasicInfo(this._queue);
        let time = parseInt(inputTime) && parseInt(inputTime) > 0 ? parseInt(inputTime) : 0;
        const length = videoInfo.videoDetails.lengthSeconds * 1000;
        if (time && time < length) {
            this.play(voice, time);
            return { result: 'SUCCESS' }
        } else {
            return { result: 'FAIL', reason: 'invalid_time' };
        }
        return { result: 'FAIL', reason: 'unknown_time' };
    }

    async skip(voice) {
        /* Save current playing song to variable and remove it */
        const current = this._queue[0];
        if (this._queue.length > 1) this._queue.shift();
        else {
            this.stop(voice);
            return current;
        }
        /* Re-play with new queue */
        voice.dispatcher.destroy();
        this.play(voice);
        /* Return skipped song */
        return current;
    }

    async stop(voice) {
        if (this._ffmpeg) this._ffmpeg.kill();
        this._queue = [];
        voice.dispatcher.destroy();
        this._playing = false;
        return;
    }
}

module.exports = PlayerClass;
