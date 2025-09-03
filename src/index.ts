import cron from 'node-cron';
import express from 'express';
import { config } from './config';
import { InvoiceProcessor } from './invoiceProcessor';

const app = express();
const processor = new InvoiceProcessor();

// Health check endpoint for Railway
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    service: 'monthly-invoice-automator',
    timestamp: new Date().toISOString()
  });
});

// Manual trigger endpoint (protected by simple token)
app.post('/trigger', express.json(), async (req, res) => {
  const token = req.headers['x-trigger-token'];
  
  if (token !== process.env.TRIGGER_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    await processor.processInvoice();
    res.json({ success: true, message: 'Invoice processed successfully' });
  } catch (error) {
    console.error('Manual trigger failed:', error);
    res.status(500).json({ error: 'Failed to process invoice' });
  }
});

// Test connections endpoint
app.get('/test', async (req, res) => {
  try {
    await processor.testConnections();
    res.json({ success: true, message: 'Connection tests completed. Check logs for details.' });
  } catch (error) {
    res.status(500).json({ error: 'Test failed' });
  }
});

// Pre-cache exchange rate (run day before invoice day)
app.post('/precache', express.json(), async (req, res) => {
  const token = req.headers['x-trigger-token'];
  
  if (token !== process.env.TRIGGER_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    await processor.preCacheExchangeRate();
    res.json({ success: true, message: 'Exchange rate pre-cached' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to pre-cache rate' });
  }
});

// Schedule monthly invoice generation
const scheduleInvoice = () => {
  // Schedule for the last day of every month at 9 AM (configurable)
  const schedule = config.cron.schedule;
  
  console.log(`Scheduling invoice generation with cron: ${schedule}`);
  
  cron.schedule(schedule, async () => {
    // Only run on actual last day of month
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (tomorrow.getDate() === 1) {
      console.log('Running scheduled invoice generation...');
      try {
        await processor.processInvoice();
      } catch (error) {
        console.error('Scheduled invoice generation failed:', error);
      }
    }
  }, {
    timezone: process.env.TZ || 'America/New_York'
  });

  // Pre-cache exchange rate 1 hour before invoice generation
  cron.schedule('0 8 28-31 * *', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Only run on actual last day of month
    if (tomorrow.getDate() === 1) {
      console.log('Pre-caching exchange rate...');
      try {
        await processor.preCacheExchangeRate();
      } catch (error) {
        console.error('Failed to pre-cache exchange rate:', error);
      }
    }
  }, {
    timezone: process.env.TZ || 'America/New_York'
  });
};

// Start server
const PORT = config.app.port;

app.listen(PORT, () => {
  console.log(`Invoice automation service running on port ${PORT}`);
  console.log(`Environment: ${config.app.nodeEnv}`);
  
  // Only schedule cron jobs in production
  if (config.app.nodeEnv === 'production') {
    scheduleInvoice();
    console.log('Cron jobs scheduled');
  } else {
    console.log('Development mode - cron jobs not scheduled');
    console.log('Use /trigger endpoint to manually process invoices');
  }
  
  // Run initial connection tests with timeout
  setTimeout(() => {
    processor.testConnections().catch(console.error);
  }, 2000);
});