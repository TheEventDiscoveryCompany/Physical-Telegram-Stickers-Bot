# Physical-Telegram-Stickers
🅱️🅱️🅱️🅱️🅱️🅱️🅱️🅱️🅱️

## NPM Modules with Private Repos

In order to deploy private repos as modules through npm, an oauth token needs to be passed in the git repo URL for the `physical-telegram-stickers-models` module. It's only possible for an oauth token to be tied to a personal account on Github, so if a new token needs to be generated, generate one by following the instructions [here](https://help.github.com/articles/creating-a-personal-access-token-for-the-command-line/).


## Setting Bot Webhook
This bot uses webhooks to retrieve Telegram messages. The webhook needs to be set on Telegram before receiving messages.

To set the webhook (and only get updates on messages):
```bash
curl -H "Content-Type: application/json" -d '{"url": "https://example.com/new-message-endpoint", "allowed_updates": ["message"]}' https://api.telegram.org/bot<api_token>/setWebhook
```