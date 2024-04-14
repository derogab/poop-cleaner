<p align="center">
  <img src="./.github/assets/logo.png" width="140px">
</p>
<h1 align="center">poop-cleaner</h1>
<p align="center">A superhero bot that saves group chats from shitty spam reported by good members</p>
<p align="center">
  <a href="https://hub.docker.com/r/derogab/poop-cleaner">
    <img src="https://img.shields.io/docker/pulls/derogab/poop-cleaner?label=Downloads&logo=docker" alt="Docker Pulls">
  </a>
  <a href="https://github.com/derogab/poop-cleaner/actions/workflows/docker-publish.yml">
    <img src="https://github.com/derogab/poop-cleaner/actions/workflows/docker-publish.yml/badge.svg">
  </a>
</p>

### Bot
First of all you need to create a bot with [BotFather](https://t.me/BotFather).  
Then, you need to:
- disable _privacy mode_ for the bot (through Bot Father), to allow the bot to read all messages.
- add the bot to your group as admin (only _deletion_ permission required).

### Configuration
Copy [.env.sample](./.env.sample) in `.env` and edit the file with own configs.

```
ADMIN_USERNAME=here_your_telegram_username
BOT_TOKEN=here_your_telegram_bot_token
DEBUG=0
POOP_THRESHOLD=10
```

### Usage
The easiest way to use the bot is via the [docker compose](./docker-compose.yml) file. When ready, run:
```
docker compose up -d 
```

### Tip
If you like this project or directly benefit from it, please consider buying me a coffee:  
🔗 `bc1qd0qatgz8h62uvnr74utwncc6j5ckfz2v2g4lef`  
⚡️ `derogab@sats.mobi`  
💶 [Sponsor on GitHub](https://github.com/sponsors/derogab)

### Credits
_poop-cleaner_ is made with ♥  by [derogab](https://github.com/derogab) and it's released under the [MIT license](./LICENSE).