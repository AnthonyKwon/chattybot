const awayHandlerMap = new Map();
const threadHeadupMap = new Map();
const threadMap = new Map();

class DiscordThread {
    constructor(guildId) {
        this._awayHandler = awayHandlerMap.get(guildId);
        this._guildId = guildId;
    }

    // (getter) get current thread
    get() { return threadMap.get(this._guildId); }

    // (setter) set current thread
    set(newThread) {
        // if thread already exists previously, delete it first
        const oldThread = threadMap.get(this._guildId);
        if (oldThread) {
            oldThread.delete("Chatty: unused voice thread deletion.");
            threadMap.delete(this._guildId);
        }
        // save new thread data
        threadMap.set(this._guildId, newThread);
    }

    get awayHandler() { return awayHandlerMap.get(this._guildId) }
    set awayHandler(value) { awayHandlerMap.set(this._guildId, value) }
    deleteAwayHandler() { awayHandlerMap.delete(this._guildId) }

    // (getter) guild id
    get guildId() { return this._guildId; }

    // (get/setter) headup message for threads
    get headup() { return threadHeadupMap.get(this._guildId); }
    set headup(value) { return threadHeadupMap.set(this._guildId, value); }

    // (static) get thread id
    static threadId(guildId) { return threadMap.get(guildId); }

    // check if thread is available
    async available() {
        const targetThread = threadMap.get(this._guildId);

        // check if object is valid thread
        if (!(typeof targetThread === 'object' && targetThread.guild.id === this._guildId))
            return false;

        /**
         * Check thread availability by changing properties.
         * properties changed or throw 'Missing Access' error when check succeeds,
         * throw an 'Unknown Channel' error when the check failed.
         * This is a very hacky way; it might have lots of problems.
        */
        try {
            await targetThread.setArchived(targetThread.archived);
            // check success; channel exists
            return true;
        } catch (err) {
            // check success; channel exists
            // bot might don't have enough permission to manage threads(SEND_MESSAGES_IN_THREADS, MANAGE_THREADS)
            if (err.message === 'Missing Access')
                return true;
            // check failed; channel not exists
            else if (err.message === 'Unknown Channel')
                return false;
            // exception; unknown error occured
            else throw err;
        }
    }

    // create new thread from headup message
    async create(headup, threadOpt) {
        const newThread = await headup.startThread(threadOpt);
        // save headup message to map
        this.headup = headup;
        // save created thread to map
        threadMap.set(this._guildId, newThread);
        // return created thread
        return newThread;
    }

    // delete old thread
    async delete(reason = undefined) {
        // delete thread only when available
        if (!await this.available()) return;
        // get current thread
        const oldThread = threadMap.get(this._guildId);
        // exit on invalid call
        if (!oldThread) return;

        // delete current thread
        await oldThread.delete(reason);
        // remove deleted thread on map
        threadMap.delete(this._guildId);

        // return deleted thread
        return oldThread;
    }

    async setLocked(locked, reason) {
        return threadMap.get(this._guildId).setLocked(locked, reason);
    }
}

module.exports = DiscordThread;
