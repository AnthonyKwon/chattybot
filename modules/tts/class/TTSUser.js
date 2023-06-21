// Get server username from user's ID
const getGuildUsername = (guild, userId) => {
	const username = guild.members.cache.get(userId).displayName;
    return username.split('_').join(' ');
}

//TODO: change this class to type
class TTSUserClass {
    constructor(discordUser, guild=undefined) {
        this._id = discordUser.id;
        // set name field to guild displayname if guild variable is provided
        // set to global displayname if not
        this._name = guild ? getGuildUsername(guild, discordUser.id) : discordUser.name;
    }

    // (getter) get TTS user id
    get id()  { return this._id; }
    // (getter) get TTS user name
    get name()  { return this._name; }
}

module.exports = TTSUserClass;