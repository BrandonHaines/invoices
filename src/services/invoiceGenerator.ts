import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { config } from '../config';

export interface InvoiceData {
  invoiceNumber: number;
  date: Date;
  amountUSD: number;
  amountEUR: number;
  exchangeRate: number;
  exchangeRateDate: string;
}

export class InvoiceGenerator {
  generatePDF(data: InvoiceData): string {
    const doc = new PDFDocument({ margin: 50 });
    const fileName = `invoice_${data.invoiceNumber}_${data.date.toISOString().split('T')[0]}.pdf`;
    const filePath = path.join(process.cwd(), 'data', fileName);

    // Ensure data directory exists
    const dataDir = path.dirname(filePath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Create write stream
    doc.pipe(fs.createWriteStream(filePath));

    // Header
    doc.fontSize(24).text('INVOICE', 50, 50);
    
    // Invoice details
    doc.fontSize(10);
    doc.text(`Invoice #: ${data.invoiceNumber}`, 400, 50);
    doc.text(`Date: ${data.date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`, 400, 65);

    // Company info (From)
    doc.fontSize(12).text('From:', 50, 120);
    doc.fontSize(10);
    doc.text(config.company.name, 50, 140);
    doc.text(config.company.address, 50, 155);
    doc.text(config.company.city, 50, 170);
    doc.text(config.company.email, 50, 185);
    doc.text(config.company.phone, 50, 200);

    // Client info (To)
    doc.fontSize(12).text('Bill To:', 300, 120);
    doc.fontSize(10);
    doc.text(config.client.name, 300, 140);
    doc.text(config.client.address, 300, 155);
    doc.text(config.client.city, 300, 170);
    doc.text(`Attn: ${config.client.contact}`, 300, 185);
    doc.text(config.client.email, 300, 200);

    // Line
    doc.moveTo(50, 240).lineTo(550, 240).stroke();

    // Invoice items header
    doc.fontSize(12);
    doc.text('Description', 50, 260);
    doc.text('Amount (USD)', 350, 260);
    doc.text('Amount (EUR)', 450, 260);

    // Line
    doc.moveTo(50, 280).lineTo(550, 280).stroke();

    // Invoice item with description
    doc.fontSize(10);
    const monthYear = data.date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const description = config.invoice.description || 'Monthly Service';
    doc.text(`Fee for ${monthYear} — ${description}`, 50, 300);
    doc.text(`$${data.amountUSD.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, 350, 300);
    doc.text(`€${data.amountEUR.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 450, 300);

    // Exchange rate info
    doc.fontSize(8);
    doc.fillColor('gray');
    doc.text(`Exchange rate: 1 USD = ${data.exchangeRate.toFixed(4)} EUR`, 350, 320);
    doc.text(`Rate date: ${data.exchangeRateDate}`, 350, 332);
    doc.fillColor('black');

    // Tax calculation if applicable
    let total = data.amountUSD;
    let totalEUR = data.amountEUR;

    if (config.invoice.taxRate > 0) {
      const taxUSD = data.amountUSD * config.invoice.taxRate;
      const taxEUR = data.amountEUR * config.invoice.taxRate;
      
      doc.fontSize(10);
      doc.text(`Tax (${(config.invoice.taxRate * 100).toFixed(0)}%)`, 50, 360);
      doc.text(`$${taxUSD.toFixed(2)}`, 350, 360);
      doc.text(`€${taxEUR.toFixed(2)}`, 450, 360);
      
      total += taxUSD;
      totalEUR += taxEUR;
    }

    // Total line
    doc.moveTo(50, 400).lineTo(550, 400).stroke();

    // Total (EUR only)
    doc.fontSize(14).font('Helvetica-Bold');
    doc.text('TOTAL', 50, 420);
    doc.text(`€${totalEUR.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 450, 420);

    // Bank details section
    doc.fontSize(11).font('Helvetica-Bold').fillColor('black');
    doc.text('Bank Details:', 50, 480);
    
    doc.fontSize(10).font('Helvetica');
    doc.text('Account holder: Varun Gaur', 50, 500);
    doc.text('BIC: TRWIBEB1XXX', 50, 515);
    doc.text('IBAN: BE90 9671 0838 4732', 50, 530);
    
    doc.fontSize(9);
    doc.text('Rue du Trone 100, 3rd floor', 50, 550);
    doc.text('Brussels, 1050', 50, 565);
    doc.text('Belgium', 50, 580);

    // Footer
    doc.fontSize(8).fillColor('gray');
    doc.text('Thank you for your business!', 50, 700, { align: 'center', width: 500 });

    // Finalize PDF
    doc.end();

    return filePath;
  }
}