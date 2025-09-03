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
          <p>Dear Client,</p>
          
          <p>Please find attached the invoice for my monthly services.</p>
          
          <p>Thank you and best regards,<br>
          Varun</p>
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