//TODO: change this class to type
class TTSUserClass {
    constructor(user) {
        this._user = user;
        // set name field to guild displayname if guild variable is provided
        // set to global displayname if not
        this._name = user.nickname ? user.nickname : user.displayName;
    }

    // (getter) get TTS user id
    get id()  { return this._user.id; }
    get name()  { return this._name; }
}

module.exports = TTSUserClass;