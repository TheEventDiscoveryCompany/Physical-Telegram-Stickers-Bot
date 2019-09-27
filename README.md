# Physical-Telegram-Stickers
A chat bot for Telegram that will print and mail you any stickers you send it! 

## Setting Bot Webhook
This bot uses webhooks to retrieve Telegram messages. The webhook needs to be set on Telegram before receiving messages.

To set the webhook (and only get updates on messages):
```bash
curl -H "Content-Type: application/json" -d '{"url": "https://example.com/new-message-endpoint", "allowed_updates": ["message"]}' https://api.telegram.org/bot<api_token>/setWebhook
```
