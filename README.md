# Chatty - Discord TTS Bot
Just a common Discord TTS Bot written in Node.JS.  

### Installation
Copy `./configs/settings.json.example` to `./configs/settings.json` and configure.  
Save your Google Cloud Platform credentials file to `./configs/gps-credentials.json`.  

### Usage
There are two launch mode defined in this application.  

  + Normal Mode (or Production Mode)
    + Can be started with `npm start` or `npm run normal` command
    + Logs will less shown up on console (error only)
    + Default mode for provided service file
  + Maintenance Mode (or Developement Mode)
    + Can be started with `npm run dev` or `npm run maintenanace` command
    + Almost all logs (everything but verbose) will shown up on console
    + Application will be launched through nodemon

