const { REST, Routes } = require('discord.js');
const config = require('../config.js');

async function getGlobalName(user) {
    let name = undefined;
    // create new rest api request
    const rest = new REST({ version: '10' }).setToken(config.token);
    // send /users/{user.id} GET api request
    const data = await rest.get(Routes.user(user.id));
    // if user has global name, set it. if not, set to old name.
    if (data.global_name) name = data.global_name;
    else name = data.username;
    return name;
}

module.exports = { getGlobalName };