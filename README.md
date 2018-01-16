# Physical-Telegram-Stickers
🅱️🅱️🅱️🅱️🅱️🅱️🅱️🅱️🅱️


## Setting Bot Webhook
This bot uses webhooks to retrieve Telegram messages. The webhook needs to be set on Telegram before receiving messages.

To set the webhook (and only get updates on messages):
```bash
curl -F "url=https://example.com/new-message-endpoint&allowed_updates[]=message"" https://api.telegram.org/bot<api_token>/setWebhook
```