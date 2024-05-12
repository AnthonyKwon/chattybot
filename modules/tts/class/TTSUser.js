const { REST, Routes } = require('discord.js');
const config = require('../../config.js');

//TODO: change this class to type
class TTSUserClass {
    constructor(guild, user) {
        this._guild = guild;
        this._user = user;
    }

    async fetchUser() {
        return this.fetchUserRaw();
    }

    async fetchUserRaw() {
        const rest = new REST().setToken(config.token);
        const rawUser = await rest.get(Routes.guildMember(this._guild.id, this._user.id));
        console.log(rawUser);
        const user = {
            id: rawUser.id,
            name: rawUser.nick ? rawUser.nick :
                rawUser.global_name ? rawUser.global_name : rawUser.username
        }
        return user;
    }
}

module.exports = TTSUserClass;