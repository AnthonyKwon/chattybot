const threadMap = new Map();

class DiscordThread {
    constructor(guildId) {
        this._guildId = guildId;
    }

    // (getter)
    get()  { return threadMap.get(this._guildId); }

    // (setter)  
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

    // create new thread from headup message
    async create(headup, threadOpt) {
        const newThread = await headup.startThread(threadOpt);
        // save created thread to map
        threadMap.set(this._guildId, newThread);
        // return created thread
        return newThread;
    }

    // delete old thread
    async delete(reason=undefined) {
        // get current thread
        const oldThread = threadMap.get(this._guildId);
        // exit on invalid call
        if(!thread) return;

        // delete current thread
        await thread.delete(reason);
        // remove deleted thread on map
        threadMap.delete(this._guildId);

        // return deleted thread
        return oldThread;
    }
}

module.exports = DiscordThread;
