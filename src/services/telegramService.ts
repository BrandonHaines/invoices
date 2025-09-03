import { Telegraf } from 'telegraf';
import { config } from '../config';
import { InvoiceData } from './invoiceGenerator';

export class TelegramService {
  private bot: Telegraf | null = null;

  constructor() {
    if (config.telegram.botToken) {
      this.bot = new Telegraf(config.telegram.botToken);
    }
  }

  async sendNotification(invoiceData: InvoiceData, emailSent: boolean): Promise<void> {
    if (!this.bot || !config.telegram.chatId) {
      console.log('Telegram not configured, skipping notification');
      return;
    }

    const monthYear = invoiceData.date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });

    const message = `
📧 *Monthly Invoice Sent*

📅 *Date:* ${monthYear}
🔢 *Invoice Number:* ${invoiceData.invoiceNumber}

💵 *Amount USD:* $${invoiceData.amountUSD.toFixed(2)}
💶 *Amount EUR:* €${invoiceData.amountEUR.toFixed(2)}

📊 *Exchange Rate:* 1 USD = ${invoiceData.exchangeRate.toFixed(4)} EUR
📆 *Rate Date:* ${invoiceData.exchangeRateDate}

✉️ *Email Status:* ${emailSent ? '✅ Sent successfully' : '❌ Failed to send'}
📬 *Sent to:* ${config.client.email}

${emailSent ? '✅ Invoice delivered successfully!' : '⚠️ Please check email configuration'}
    `;

    try {
      await this.bot.telegram.sendMessage(config.telegram.chatId, message, {
        parse_mode: 'Markdown'
      });
      console.log('Telegram notification sent successfully');
    } catch (error) {
      console.error('Failed to send Telegram notification:', error);
      // Don't throw - Telegram notification is not critical
    }
  }

  async sendTestMessage(): Promise<boolean> {
    if (!this.bot || !config.telegram.chatId) {
      console.log('Telegram not configured');
      return false;
    }

    try {
      await this.bot.telegram.sendMessage(
        config.telegram.chatId, 
        '🔔 Invoice automation system connected successfully!'
      );
      console.log('Telegram test message sent');
      return true;
    } catch (error) {
      console.error('Failed to send Telegram test message:', error);
      return false;
    }
  }
}