# Physical-Telegram-Stickers
🅱️🅱️🅱️🅱️🅱️🅱️🅱️🅱️🅱️

## Updating submodules
To update submodules:
```bash
git submodule update --init --recursive
```

## Setting Bot Webhook
This bot uses webhooks to retrieve Telegram messages. The webhook needs to be set on Telegram before receiving messages.

To set the webhook (and only get updates on messages):
```bash
curl -H "Content-Type: application/json" -d '{"url": "https://example.com/new-message-endpoint", "allowed_updates": ["message"]}' https://api.telegram.org/bot<api_token>/setWebhook
```