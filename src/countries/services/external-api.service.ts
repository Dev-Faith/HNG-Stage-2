// src/countries/services/external-api.service.ts
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

interface CountryData {
  name: string;
  capital?: string;
  region: string;
  population: number;
  flag: string;
  currencies?: Array<{ code: string }>; // Make optional
}


interface ExchangeRates {
  rates: Record<string, number>;
}

@Injectable()
export class ExternalApiService {
  private readonly countriesApi = 'https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies';
  private readonly exchangeApi = 'https://open.er-api.com/v6/latest/USD';

  async fetchCountriesData(): Promise<CountryData[]> {
    try {
      const response = await axios.get<CountryData[]>(this.countriesApi, {
        timeout: 10000,
      });
      return response.data;
    } catch (error) {
      throw new HttpException(
        'External data source unavailable',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  async fetchExchangeRates(): Promise<ExchangeRates> {
    try {
      const response = await axios.get<ExchangeRates>(this.exchangeApi, {
        timeout: 10000,
      });
      return response.data;
    } catch (error) {
      throw new HttpException(
        'External data source unavailable',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  calculateEstimatedGdp(population: number, exchangeRate: number): number {
    const randomMultiplier = Math.random() * 1000 + 1000; // 1000-2000
    return (population * randomMultiplier) / exchangeRate;
  }

  extractCurrencyCode(currencies: any[] | undefined): string | null {
    // Handle undefined or empty arrays
    if (!currencies || currencies.length === 0) {
      return null;
    }
    return currencies[0]?.code || null;
  }
}