const { REST, Routes } = require('discord.js');
const config = require('../../config.js');

const userCache = new Map();
const timerCache = new Map();

//TODO: change this class to type
class TTSUserClass {
    constructor(guild, user) {
        this._guild = guild;
        this._user = user;
    }

    fetchCacheId() { return `${this._guild}::${this._user}` }

    async fetchUser(force = false) {
        // fetch from cache if exists
        if (!force && userCache.get(this.fetchCacheId())) return this.fetchUserCache();
        // fetch from server if not exists
        else return await this.fetchUserRaw();
    }

    // fetch user data from cache
    fetchUserCache() {
        return userCache.get(this.fetchCacheId());
    }

    // fetch user data from discord_legacy server
    async fetchUserRaw(force = false) {
        // cancel the cache purge timer (if exists)
        if (timerCache.get(this.fetchCacheId())) {
            clearTimeout(timerCache.get(this.fetchCacheId()));
            timerCache.delete(this.fetchCacheId());
        }

        // initialize REST API parser
        const rest = new REST().setToken(config.token);
        // fetch member from API
        const rawUser = await rest.get(Routes.guildMember(this._guild.id, this._user.id));
        // create user data object
        const user = {
            id: rawUser.user.id,
            name: rawUser.nick ? rawUser.nick :
                rawUser.user.global_name ? rawUser.user.global_name : rawUser.user.username
        }

        // save to cache for 1 day
        const cachePurgeTimer = setTimeout(() => userCache.delete(this.fetchCacheId()), 180000);
        userCache.set(this.fetchCacheId(), user);
        timerCache.set(this.fetchCacheId(), cachePurgeTimer);

        return user;
    }
}

module.exports = TTSUserClass;