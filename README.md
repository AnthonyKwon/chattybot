# 💬 Chatty: A Discord Text-to-Speech Bot

Chatty is a simple, open-source Text-to-Speech (TTS) bot for Discord, designed to bring your server's voice channels to life. Built with Node.js, it's configurable and easy to set up.

## ✨ Features

* **High-Quality TTS**: Utilizes Google Cloud Text-to-Speech for natural-sounding voices.
* **Multi-language Support**: Configurable to work with different languages.
* **Easy to Use**: Simple commands to join/leave voice channels and manage the bot.
* **Configurable**: Customize the bot's behavior, TTS voice, and more through simple JSON configuration files.

## 📋 Requirements

* **Node.js**: Version 20 or higher.

## 🚀 Installation

1. **Clone the repository**

    ```bash
    git clone https://github.com/AnthonyKwon/chattybot.git -b 3.2.1
    cd chattybot
    ```

2. **Install dependencies**

    ```bash
    npm install
    ```

3. **Configure the bot**

    * Copy `configs/general.json.example` to `configs/general.json`.
    * Copy `configs/tts.json.example` to `configs/tts.json`.
    * Edit `general.json` and `tts.json` to your liking.

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

* **`general.json`**: For general bot settings, such as your Discord bot token and default locale.
* **`tts.json`**: For Text-to-Speech settings, like voice gender, speed, and pitch.
* **`gcp-credentials.json`**: Your Google Cloud Platform credentials file.

## ▶️ Usage

### Authentication

You can authenticate with Google Cloud TTS in two ways:

1. **Workload Identity Federation (Recommended):**
   Set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable to the path of your credentials file:

    ```bash
    export GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/credentials.json
    ```

2. **Service Account Keys:**
   Place your service account key file in the `configs/` directory and name it `gcp-credentials.json`.

### Running the Bot

There are two ways to run Chatty:

* **Production Mode**:

    ```bash
    npm start
    ```

  This will start the bot with minimal console logging.

* **Development Mode**:

    ```bash
    npm run dev
    ```

  This will start the bot in development mode, with more verbose logging.

## 🙌 Contributing

Pull requests are welcome\! For major changes, please open an issue first to discuss what you would like to change.

## 📜 License

This project is licensed under the [GNU General Public License, version 2](https://www.gnu.org/licenses/old-licenses/gpl-2.0.html).
