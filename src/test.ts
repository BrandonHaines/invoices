import { InvoiceProcessor } from './invoiceProcessor';

async function testSystem() {
  console.log('=== Invoice Automation System Test ===\n');
  
  const processor = new InvoiceProcessor();
  
  // Test connections
  console.log('Testing connections...');
  await processor.testConnections();
  
  console.log('\n--- Manual Invoice Generation Test ---');
  console.log('To test invoice generation, run: npm run dev');
  console.log('Then make a POST request to: http://localhost:3000/trigger');
  console.log('Include header: x-trigger-token: your-secret-token\n');
  
  console.log('=== Configuration Checklist ===');
  console.log('1. Copy .env.example to .env');
  console.log('2. Set your invoice details (amount, starting number)');
  console.log('3. Configure email settings (SMTP credentials)');
  console.log('4. Set up Telegram bot token and chat ID');
  console.log('5. Get exchange rate API key from exchangerate-api.com');
  console.log('6. Set TRIGGER_TOKEN for manual triggers');
  
  process.exit(0);
}

testSystem().catch(console.error);