import { StateManager } from './utils/state';
import { ExchangeRateService } from './utils/exchangeRate';
import { InvoiceGenerator, InvoiceData } from './services/invoiceGenerator';
import { EmailService } from './services/emailService';
import { config } from './config';

export class InvoiceProcessor {
  private stateManager: StateManager;
  private exchangeRateService: ExchangeRateService;
  private invoiceGenerator: InvoiceGenerator;
  private emailService: EmailService;

  constructor() {
    this.stateManager = new StateManager();
    this.exchangeRateService = new ExchangeRateService();
    this.invoiceGenerator = new InvoiceGenerator();
    this.emailService = new EmailService();
  }

  async processInvoice(): Promise<void> {
    console.log('Starting invoice processing...');

    try {
      // Get next invoice number
      const invoiceNumber = this.stateManager.getNextInvoiceNumber();
      console.log(`Creating invoice #${invoiceNumber}`);

      // Get exchange rate
      const rateInfo = await this.exchangeRateService.getRate();
      console.log(`Exchange rate: 1 USD = ${rateInfo.rate} EUR (${rateInfo.cached ? 'cached' : 'live'})`);

      // Calculate amounts
      const amountUSD = config.invoice.amountUSD;
      const amountEUR = amountUSD * rateInfo.rate;

      // Prepare invoice data - use current month for invoice
      const invoiceData: InvoiceData = {
        invoiceNumber,
        date: new Date(),
        amountUSD,
        amountEUR,
        exchangeRate: rateInfo.rate,
        exchangeRateDate: rateInfo.date
      };

      // Generate PDF
      const pdfPath = this.invoiceGenerator.generatePDF(invoiceData);
      console.log(`Invoice PDF generated: ${pdfPath}`);

      // Send email
      let emailSent = false;
      try {
        await this.emailService.sendInvoice(invoiceData, pdfPath);
        emailSent = true;
      } catch (error) {
        console.error('Failed to send invoice email:', error);
      }


      // Update state only if email was sent successfully
      if (emailSent) {
        this.stateManager.updateInvoiceNumber(invoiceNumber);
        console.log('Invoice processed successfully!');
      } else {
        console.error('Invoice generated but email failed to send');
      }

    } catch (error) {
      console.error('Error processing invoice:', error);
      throw error;
    }
  }

  async preCacheExchangeRate(): Promise<void> {
    console.log('Pre-caching exchange rate for tomorrow...');
    await this.exchangeRateService.preCacheRate();
  }

  async testConnections(): Promise<void> {
    console.log('Testing connections...');
    
    // Test email
    const emailOk = await this.emailService.testConnection();
    console.log(`Email connection: ${emailOk ? '✓' : '✗'}`);
    
    // Test exchange rate
    try {
      const rate = await this.exchangeRateService.getRate();
      console.log(`Exchange rate API: ✓ (1 USD = ${rate.rate} EUR)`);
    } catch (error) {
      console.log('Exchange rate API: ✗');
    }
  }
}