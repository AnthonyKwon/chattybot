# Configuration

This documentation covers configurations files, and its entries.

## 📄 general.json

It serves every common configurations, or configurations which haven't assigned dedicated file.

- `version`: Config Version Identifier
  - **Required**, must be `1`
- `discord.token`: Token of the bot
  - **Required**, you can get token in [Discord Developer Portal](https://discord.com/developers/applications).
- `discord.inviteLink`: Invite link to the bot
  - Optional, currently does nothing.
- `discord.archiveDuration`: Duration until thread gets archived
  - Optional, defaults to 60 minutes.
  - Unit: `Minute`
- `log.timeLimit`: Time limit until log gets rotated.
  - Optional, disabled when not set.
  - Unit: `Hour`
- `log.sizeLimit`: File size limit until log gets rotated.
  - Optional, disabled when not set.
  - Unit: `KB`
- `defaultLocale`: Default locale to used by bot
  - Required, used when failed to fetch locale from guild or user.
  - List of available locales are in [this documentation](https://discord.com/developers/docs/reference#locales).
- `cooldown`: Cooldown to set in thread
  - Optional, disabled when not set.
  - Unit: `second`
- `inactiveTimeout`: Duration until bot disconnects from Voice due to inactivity
  - Optional, disabled when not set.
  - Unit: `second`

## 📄 tts.json

It serves every configuration relative to Text-to-Speech.  
Some of the options can be overriden by guild settings.  
Example file is located at `tts.json.example`.

- `version`: Config Version Identifier
  - **Required**, must be `1`
- `gender`: Gender of the voice
  - Optional, defaults to `neutral`
  - Available values are:
    - `female`
    - `male`
    - `neutral`
- `pitch`: Pitch of the voice
  - Optional, defaults to `100`.
  - Any integer between 0 ~ 200 is available.
  - Unit: `%`
- `speed`: Speed of the voice
  - Optional, defaults to `100`.
  - Any integer between 0 ~ 200 is available.
  - Unit: `%`
- `volume`: Volume of the voice
  - Optional, defaults to `100`.
  - Any integer between 50 ~ 200 is available.
  - Unit: `%`
- `allowSSML`: Allow SSML to be used from chat
  - Optional, defaults to `false`.
  - Currently does nothing.
- `provider`: Text-to-Speech provider to use
  - **Required**, must specify one of providers below.
  - `GoogleCloud` is the only available provider currently.
- `providerOptions.GoogleCloud.preferredTypes`: Priority of the voice type to use
  - Required, must be specified as the array.
  - You can start by using one in example, and removing the type you don't want to use.
  - Additional Description: `Neural2` part of `en-US-Neural2-C`.
- `providerOptions.GoogleCloud.defaultVariant`: Variant of the voice to priotize
  - Optional, use first variant returned by API when not specified.
  - Additional Description: `C` part of `en-US-Neural2-C`.

## 📄 gcp-credentials.json

📌 **Note**: You don't need this file if you're using Workload Identity Federation as authentication method.  

This is your Google Cloud Platform credentials file.  
It is required if you're using Google Cloud Text-to-Speech as provider, and using Service Account Key to authenticate.  

Follow this guide to [create service account key](https://cloud.google.com/iam/docs/keys-create-delete) or [download a created service account key](https://cloud.google.com/iam/docs/keys-list-get), rename it as `gcp-credentials.json`, and place it into `config/` directory.

Application will refuse to launch without it.
