# 💬 Chatty: A Discord Text-to-Speech Bot

Chatty is a simple, open-source Text-to-Speech (TTS) bot for Discord, designed to bring your server's voice channels to life. Built with Node.js, it's configurable and easy to set up.

## ✨ Features

- **High-Quality TTS**: Utilizes Google Cloud Text-to-Speech for natural-sounding voices.
- **Multi-language Support**: Configurable to work with different languages.
- **Easy to Use**: Simple commands to join/leave voice channels and manage the bot.
- **Configurable**: Customize the bot's behavior, TTS voice, and more through simple JSON configuration files.

## 📋 Requirements

- **Node.js** version 22.12.0 or higher
- **Build Tools** for sodium
    - Windows user can install dependencies by this command:

      ```batch
      npm install --global --production --add-python-to-path windows-build-tools
      ```

    - macOS/Linux needs packages below:
        - `make`
        - `gcc` with C++ support
        - `libtool`

## 🚀 Installation

1. **Clone the repository**

    ```bash
    git clone https://github.com/AnthonyKwon/chattybot.git -b legacy/3.2.1
    cd chattybot
    ```

2. **Install dependencies**

    ```bash
    npm install
    ```

3. **Configure the bot**

   Please refer [Configuration](#configuration) section to do it.

4. **Build the application**

    ```bash
    npm run build
    ```

5. **Register slash commands**

    ```bash
    npm run register
    ```

## <a name="configuration"></a>⚙️ Configuration

Chatty is configured through three files in the `configs/` directory:

- `settings.json5`: For overall configuration of the application.
- `gcp-credentials.json`: Your Google Cloud Platform credentials file.

Please refer [CONFIGURATION.md](assets/docs/CONFIGURATION.md) for more details.

## ▶️ Usage

### Authentication

Place your service account key file in the `configs/` directory and name it `gcp-credentials.json`.

### Running the Bot

There are two ways to run Chatty:

- **Production Mode** (Recommended for most cases):

    ```bash
    npm start
    ```

  This will start the bot with minimal console logging.

- **Development Mode**:

  You have to register command as development mode first, with:

    ```bash
    npm run registerDev
    ```

  Then you can start as development mode with command below.

    ```bash
    npm run dev
    ```

  This will start the bot in development mode, with more verbose logging.

We also have [systemd unit file](assets/docs/systemd-service-units/chattybot.service) and [docker image](https://git.thonlog.com/AnthonyKwon/-/packages/container/chattybot) for automation.

## 🙌 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## 📜 License

This project is licensed under the [GNU General Public License, version 2](https://www.gnu.org/licenses/old-licenses/gpl-2.0.html).
