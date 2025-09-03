import fs from 'fs';
import path from 'path';

const STATE_FILE = path.join(process.cwd(), 'data', 'state.json');

interface State {
  lastInvoiceNumber: number;
  lastInvoiceDate: string;
}

export class StateManager {
  private state!: State;

  constructor() {
    this.ensureDataDirectory();
    this.loadState();
  }

  private ensureDataDirectory(): void {
    const dataDir = path.dirname(STATE_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }

  private loadState(): void {
    try {
      if (fs.existsSync(STATE_FILE)) {
        const data = fs.readFileSync(STATE_FILE, 'utf-8');
        this.state = JSON.parse(data);
      } else {
        this.state = {
          lastInvoiceNumber: parseInt(process.env.INVOICE_START_NUMBER || '1000'),
          lastInvoiceDate: ''
        };
        this.saveState();
      }
    } catch (error) {
      console.error('Error loading state:', error);
      this.state = {
        lastInvoiceNumber: parseInt(process.env.INVOICE_START_NUMBER || '1000'),
        lastInvoiceDate: ''
      };
    }
  }

  private saveState(): void {
    try {
      fs.writeFileSync(STATE_FILE, JSON.stringify(this.state, null, 2));
    } catch (error) {
      console.error('Error saving state:', error);
    }
  }

  getNextInvoiceNumber(): number {
    return this.state.lastInvoiceNumber + 1;
  }

  updateInvoiceNumber(number: number): void {
    this.state.lastInvoiceNumber = number;
    this.state.lastInvoiceDate = new Date().toISOString();
    this.saveState();
  }

  getLastInvoiceDate(): string {
    return this.state.lastInvoiceDate;
  }
}