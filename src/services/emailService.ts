import * as nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { config } from '../config';
import { InvoiceData } from './invoiceGenerator';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.port === 465,
      auth: {
        user: config.email.user,
        pass: config.email.pass
      }
    });
  }

  async sendInvoice(invoiceData: InvoiceData, pdfPath: string): Promise<void> {
    const fileName = path.basename(pdfPath);
    const monthYear = invoiceData.date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });

    const mailOptions = {
      from: config.email.from,
      to: config.email.to,
      cc: config.email.cc || undefined,
      subject: `Invoice #${invoiceData.invoiceNumber} - ${monthYear}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2>Invoice for ${monthYear}</h2>
          
          <p>Dear ${config.client.contact || 'Client'},</p>
          
          <p>Please find attached the invoice for our monthly services.</p>
          
          <table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Invoice Number:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${invoiceData.invoiceNumber}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Date:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${invoiceData.date.toLocaleDateString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Amount (USD):</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">$${invoiceData.amountUSD.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Amount (EUR):</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">€${invoiceData.amountEUR.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Exchange Rate:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">1 USD = ${invoiceData.exchangeRate.toFixed(4)} EUR</td>
            </tr>
          </table>
          
          <p><strong>Payment Terms:</strong> Net 30 days</p>
          
          <p>Please include the invoice number with your payment.</p>
          
          <p>Thank you for your continued business!</p>
          
          <hr style="margin: 30px 0;">
          
          <p style="color: #666; font-size: 12px;">
            ${config.company.name}<br>
            ${config.company.email}<br>
            ${config.company.phone}
          </p>
        </div>
      `,
      attachments: [
        {
          filename: fileName,
          path: pdfPath
        }
      ]
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Invoice email sent successfully to ${config.email.to}`);
    } catch (error) {
      console.error('Failed to send invoice email:', error);
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('Email server connection verified');
      return true;
    } catch (error) {
      console.error('Email server connection failed:', error);
      return false;
    }
  }
}