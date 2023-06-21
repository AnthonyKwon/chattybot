const { getGlobalName } = require('../../discordutils/globalname.js');

// Get server username from user's ID
const getUsername = (user, guild=undefined) => {
    let username = undefined;
    if (guild) {
        // get user display name from guild
	    username = guild.members.cache.get(user.id).displayName;
        username = username.split('_').join(' ')
    } else {
        // get user display name directly
        username = getGlobalName(user);
    }
    return username;
}

//TODO: change this class to type
class TTSUserClass {
    constructor(discordUser, guild=undefined) {
        this._user = discordUser;
        // set name field to guild displayname if guild variable is provided
        // set to global displayname if not
        this._name = guild ? getUsername(discordUser, guild) : discordUser.name;
    }

    // (getter) get TTS user id
    get id()  { return this._user.id; }

    // get TTS user name
    async getUsername() { 
        let username = undefined;
        if (this._guild) {
            // get user display name from guild
            username = this._guild.members.cache.get(user.id).displayName;
            username = username.split('_').join(' ')
        } else {
            // get user display name directly
            username = getGlobalName(this._user);
        }
        return username;
     }
}

module.exports = TTSUserClass;