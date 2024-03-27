const threadHeadupMap = new Map();
const threadMap = new Map();

class DiscordThread {
    constructor(guildId) {
        this._guildId = guildId;
        this._deleted = false;
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

    // (getter) guild id
    get guildId() { return this._guildId; }

    // (get/setter) headup message for threads
    get headup() { return threadHeadupMap.get(this._guildId); }
    set headup(value) { return threadHeadupMap.set(this._guildId, value); }

    get deleted() { return this._deleted; }
    set deleted(value) { this._deleted = value; }


    // (static) get thread id
    static threadId(guildId) { return threadMap.get(guildId); }

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
        // get current thread
        const oldThread = threadMap.get(this._guildId);
        // exit on invalid call
        if (!oldThread) return;

        // rename thread to dummy name
        // to prevent discord double-calling the onDelete() method
        await oldThread.setArchived(false);
        await oldThread.edit({ name: '__REMOVEME_CHATTYDISPOSAL' });

        // delete current thread
        await oldThread.delete(reason);
        // remove deleted thread on map
        threadMap.delete(this._guildId);

        // set deleted marker to true
        this._deleted = true;

        // return deleted thread
        return oldThread;
    }

    async setLocked(locked, reason) {
        return threadMap.get(this._guildId).setLocked(locked, reason);
    }
}

module.exports = DiscordThread;
