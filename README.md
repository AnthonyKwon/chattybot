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
    git clone https://github.com/AnthonyKwon/chattybot.git -b 4.0.0-beta.4.1
    cd chattybot
    ```

2. **Install dependencies**

    ```bash
    npm install
    ```

3. **Configure the bot**

    - Copy `configs/general.json.example` to `configs/general.json`.
    - Copy `configs/tts.json.example` to `configs/tts.json`.
    - Edit `general.json` and `tts.json` to your liking.

4. **Build the application**

    ```bash
    npm run build
    ```

5. **Register slash commands**

    ```bash
    npm run register
    ```

## ⚙️ Configuration

Chatty is configured through three files in the `configs/` directory:

- `general.json`: For general bot settings, such as your Discord bot token and default locale.
- `tts.json`: For Text-to-Speech settings, like voice gender, speed, and pitch.
- `gcp-credentials.json`: Your Google Cloud Platform credentials file.

Please refer [CONFIGURATION.md](assets/docs/CONFIGURATION.md) for more details.

## ▶️ Usage

### Authentication

You can authenticate with Google Cloud TTS in two ways:

1. **Workload Identity Federation (Recommended):**
   Set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable to the path of your credentials file:

    ```bash
    export GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/credentials
    ```

2. **Service Account Keys:**
   Place your service account key file in the `configs/` directory and name it `gcp-credentials.json`.

### Running the Bot

There are two ways to run Chatty:

- **Production Mode**:

    ```bash
    npm start
    ```

  This will start the bot with minimal console logging.  
  We also have [systemd unit file](assets/docs/systemd-service-units/chattybot.service) for automatic startup.

- **Development Mode**:

    ```bash
    npm run dev
    ```

  This will start the bot in development mode, with more verbose logging.

## 🙌 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## 📜 License

This project is licensed under the [GNU General Public License, version 2](https://www.gnu.org/licenses/old-licenses/gpl-2.0.html).
