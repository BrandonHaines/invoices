# Monthly Invoice Automator

Automated monthly invoice generation system with EUR conversion and Telegram notifications.

## Features

- 📄 Automatic PDF invoice generation
- 💱 Live USD to EUR conversion with caching fallback
- 📧 Email delivery with PDF attachment
- 📱 Telegram notifications for confirmation
- ⏰ Monthly cron scheduling
- 🔄 Pre-caching exchange rates
- 🚀 Railway deployment ready

## Setup

### 1. Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Key configurations:
- **Invoice Details**: Amount, starting number, tax rate
- **Company & Client Info**: Names, addresses, contacts
- **Email**: SMTP settings (Gmail, SendGrid, etc.)
- **Telegram**: Bot token and chat ID
- **Exchange Rate API**: Get free key from [exchangerate-api.com](https://exchangerate-api.com)

### 2. Telegram Bot Setup

1. Message [@BotFather](https://t.me/botfather) on Telegram
2. Create new bot: `/newbot`
3. Copy the bot token to `TELEGRAM_BOT_TOKEN`
4. Start chat with your bot
5. Get chat ID by messaging the bot and visiting:
   ```
   https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates
   ```

### 3. Email Configuration

For Gmail:
1. Enable 2-factor authentication
2. Generate app-specific password
3. Use as `EMAIL_PASS`

For other providers, use appropriate SMTP settings.

### 4. Exchange Rate API

1. Sign up at [exchangerate-api.com](https://app.exchangerate-api.com/sign-up)
2. Get free API key (1500 requests/month)
3. Add to `EXCHANGE_RATE_API_KEY`

## Local Development

```bash
# Install dependencies
npm install

# Test connections
npm test

# Run in development mode
npm run dev

# Build for production
npm run build
```

## Manual Testing

With server running (`npm run dev`):

```bash
# Test invoice generation
curl -X POST http://localhost:3000/trigger \
  -H "x-trigger-token: your-secret-token"

# Pre-cache exchange rate
curl -X POST http://localhost:3000/precache \
  -H "x-trigger-token: your-secret-token"

# Test connections
curl http://localhost:3000/test
```

## Railway Deployment

1. **GitHub Repository**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_URL
   git push -u origin main
   ```

2. **Railway Setup**:
   - Create new project on [Railway](https://railway.app)
   - Connect GitHub repository
   - Add environment variables from `.env`
   - Deploy

3. **Important Environment Variables for Railway**:
   ```
   NODE_ENV=production
   TRIGGER_TOKEN=<secure-random-token>
   TZ=America/New_York  # Your timezone
   ```

## Cron Schedule

Default: 1st of every month at 9 AM

Format: `0 9 1 * *` (minute hour day month weekday)

Examples:
- `0 9 1 * *` - 1st at 9 AM
- `0 14 15 * *` - 15th at 2 PM
- `0 10 L * *` - Last day at 10 AM

## API Endpoints

- `GET /health` - Health check
- `GET /test` - Test all connections
- `POST /trigger` - Manual invoice generation (requires token)
- `POST /precache` - Pre-cache exchange rate (requires token)

## File Structure

```
monthly-invoice-automator/
├── src/
│   ├── config.ts           # Configuration
│   ├── index.ts            # Main app & cron
│   ├── invoiceProcessor.ts # Core logic
│   ├── services/
│   │   ├── emailService.ts
│   │   ├── invoiceGenerator.ts
│   │   └── telegramService.ts
│   └── utils/
│       ├── exchangeRate.ts
│       └── state.ts
├── data/                   # Generated files
│   ├── state.json         # Invoice counter
│   ├── exchange-cache.json
│   └── *.pdf              # Generated invoices
└── package.json
```

## State Management

The system maintains state in `data/state.json`:
- Last invoice number
- Last invoice date

This ensures invoice numbers increment correctly even after restarts.

## Exchange Rate Caching

- Rates cached daily
- Falls back to cached rate if API fails
- Pre-cache runs day before invoice generation
- Manual pre-cache available via API

## Security

- Use strong `TRIGGER_TOKEN` for manual endpoints
- Keep `.env` file secure
- Never commit secrets to repository
- Use Railway's environment variables in production

## Troubleshooting

1. **Email not sending**: Check SMTP credentials and ports
2. **Telegram not working**: Verify bot token and chat ID
3. **Exchange rate failing**: Check API key and limits
4. **Cron not running**: Ensure `NODE_ENV=production` on Railway

## License

ISC