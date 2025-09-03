import dotenv from 'dotenv';
dotenv.config();

export const config = {
  invoice: {
    startNumber: parseInt(process.env.INVOICE_START_NUMBER || '1001'),
    amountUSD: parseFloat(process.env.INVOICE_AMOUNT_USD || '1000'),
    taxRate: parseFloat(process.env.INVOICE_TAX_RATE || '0'),
    currencySymbol: process.env.INVOICE_CURRENCY_SYMBOL || '$',
    description: process.env.INVOICE_DESCRIPTION || 'Monthly Service'
  },
  company: {
    name: process.env.COMPANY_NAME || 'Your Company',
    address: process.env.COMPANY_ADDRESS || '',
    city: process.env.COMPANY_CITY || '',
    email: process.env.COMPANY_EMAIL || '',
    phone: process.env.COMPANY_PHONE || ''
  },
  client: {
    name: process.env.CLIENT_NAME || 'Client Company',
    address: process.env.CLIENT_ADDRESS || '',
    city: process.env.CLIENT_CITY || '',
    email: process.env.CLIENT_EMAIL || '',
    contact: process.env.CLIENT_CONTACT || ''
  },
  email: {
    from: process.env.EMAIL_FROM || '',
    to: process.env.EMAIL_TO || '',
    cc: process.env.EMAIL_CC || '',
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || ''
  },
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || '',
    chatId: process.env.TELEGRAM_CHAT_ID || ''
  },
  exchangeRate: {
    apiKey: process.env.EXCHANGE_RATE_API_KEY || ''
  },
  cron: {
    schedule: process.env.CRON_SCHEDULE || '0 9 1 * *'
  },
  app: {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000')
  }
};