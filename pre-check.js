const { existsSync } = require('fs');

// pre-check: check if settings file exists
if (!existsSync('./configs/settings.json5')) {
    console.error('Failed to locate config file!');
    console.error('You can refer "configs/settings.json5.example" to create new one.');
    process.exit(1);
}

// pre-check done. start main application
require('./main')