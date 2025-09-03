import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { config } from '../config';

const CACHE_FILE = path.join(process.cwd(), 'data', 'exchange-cache.json');

interface ExchangeCache {
  rate: number;
  timestamp: string;
  date: string;
}

export class ExchangeRateService {
  private cache: ExchangeCache | null = null;

  constructor() {
    this.loadCache();
  }

  private loadCache(): void {
    try {
      if (fs.existsSync(CACHE_FILE)) {
        const data = fs.readFileSync(CACHE_FILE, 'utf-8');
        this.cache = JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading exchange cache:', error);
      this.cache = null;
    }
  }

  private saveCache(rate: number): void {
    try {
      const dataDir = path.dirname(CACHE_FILE);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      this.cache = {
        rate,
        timestamp: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0]
      };

      fs.writeFileSync(CACHE_FILE, JSON.stringify(this.cache, null, 2));
    } catch (error) {
      console.error('Error saving exchange cache:', error);
    }
  }

  private async fetchLiveRate(): Promise<number> {
    try {
      const apiKey = config.exchangeRate.apiKey;
      
      if (!apiKey) {
        console.warn('No exchange rate API key configured, using fallback rate');
        return 0.86; // Fallback rate with 0.6% fee added
      }

      // Using exchangerate-api.com
      const response = await axios.get(
        `https://v6.exchangerate-api.com/v6/${apiKey}/pair/USD/EUR`,
        { timeout: 5000 }
      );

      if (response.data && response.data.conversion_rate) {
        // Add 0.6% fee in favor (multiply by 1.006 to increase EUR amount by 0.6%)
        return response.data.conversion_rate * 1.006;
      }

      throw new Error('Invalid API response');
    } catch (error) {
      console.error('Error fetching live exchange rate:', error);
      throw error;
    }
  }

  async getRate(): Promise<{ rate: number; cached: boolean; date: string }> {
    const today = new Date().toISOString().split('T')[0];

    // Check if we have today's rate cached
    if (this.cache && this.cache.date === today) {
      console.log('Using cached exchange rate from today');
      return {
        rate: this.cache.rate,
        cached: true,
        date: this.cache.date
      };
    }

    // Try to fetch live rate
    try {
      const liveRate = await this.fetchLiveRate();
      this.saveCache(liveRate);
      console.log('Fetched and cached new exchange rate');
      return {
        rate: liveRate,
        cached: false,
        date: today
      };
    } catch (error) {
      // Fall back to yesterday's cached rate if available
      if (this.cache) {
        console.log('Using cached exchange rate from', this.cache.date);
        return {
          rate: this.cache.rate,
          cached: true,
          date: this.cache.date
        };
      }

      // Ultimate fallback
      console.warn('No cached rate available, using fallback rate');
      return {
        rate: 0.86, // Fallback rate with 0.6% fee added
        cached: false,
        date: today
      };
    }
  }

  // Pre-cache tomorrow's rate (run day before invoice day)
  async preCacheRate(): Promise<void> {
    try {
      const liveRate = await this.fetchLiveRate();
      this.saveCache(liveRate);
      console.log('Successfully pre-cached exchange rate:', liveRate);
    } catch (error) {
      console.error('Failed to pre-cache exchange rate:', error);
    }
  }
}