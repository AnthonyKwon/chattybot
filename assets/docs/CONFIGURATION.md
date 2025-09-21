# Configuration

This documentation covers configurations files in `configs/` directory, and its entries.

## 📄 general.json

It serves every configuration for application.  
Example file is located at `settings.json5.example`.

- `log-rotate.timeLimit`: Time limit until log gets rotated.
    - **Required**
    - Unit: `Hour`
- `log-rotate.sizeLimit`: File size limit until log gets rotated.
    - **Required**
    - Unit: `KB`
- `token`: Token of the bot
    - **Required**
    - you can get token in [Discord Developer Portal](https://discord.com/developers/applications).
- `inviteLink`: Invite link to the bot
    - Optional
    - Currently, does nothing.
- `locale`: Default locale to used by bot
    - **Required**
    - Used when failed to fetch locale from guild or user.
    - List of available locales are in [this documentation](https://discord.com/developers/docs/reference#locales).
- `status`: Status message of the bot.
    - Optional
    - Disabled when not set.
- `awayTime`: Duration until bot disconnects from Voice due to inactivity
    - **Required**
    - Unit: `second`
- `ttsGender`: Gender of the voice
  - Optional
  - Currently, does nothing.
- `ttsProvider`: Text-to-Speech provider to use
    - **Required**
    - Must specify one of providers below.
    - `GoogleCloud` is the only available provider currently.
- `GcpTtsPreferredType`: Priority of the voice type to use
  - **Required**
  - Must specify one of the value below.
  - Available values are:
    - `Studio`
    - `Neural2`
    - `Wavenet`
    - `Standard`
  - Additional Description: `Neural2` part of `en-US-Neural2-C`.
- `providerOptions.GoogleCloud.defaultVariant`: Variant of the voice to prioritize
    - **Required**
    - Must specify variant to use.
    - Additional Description: `C` part of `en-US-Neural2-C`.

## 📄 gcp-credentials.json

This is your Google Cloud Platform credentials file.  
It is required if you're using Google Cloud Text-to-Speech as provider, and using Service Account Key to authenticate.

Follow this guide to [create service account key](https://cloud.google.com/iam/docs/keys-create-delete) or [download a created service account key](https://cloud.google.com/iam/docs/keys-list-get), rename it as `gcp-credentials.json`, and place it into `configs/` directory.

Application will refuse to launch without it.
