# Physical-Telegram-Stickers
🅱️🅱️🅱️🅱️🅱️🅱️🅱️🅱️🅱️

## Submodules

To install/update submodules:
```bash
git submodule update --init --recursive --remote
```

### Deployment

In order for submodule deployment for private repos to work on Heroku, an oauth token needs to be passed in the URL of the submodule git repo. It's only possible for an oauth token to be tied to a personal account.

If a new token needs to be generated, generate a new token by following the instructions [here](https://help.github.com/articles/creating-a-personal-access-token-for-the-command-line/) and 


## Setting Bot Webhook
This bot uses webhooks to retrieve Telegram messages. The webhook needs to be set on Telegram before receiving messages.

To set the webhook (and only get updates on messages):
```bash
curl -H "Content-Type: application/json" -d '{"url": "https://example.com/new-message-endpoint", "allowed_updates": ["message"]}' https://api.telegram.org/bot<api_token>/setWebhook
```