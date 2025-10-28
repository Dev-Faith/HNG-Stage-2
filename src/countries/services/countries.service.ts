// src/countries/services/countries.service.ts
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Country } from '../entities/country.entity';
import { ExternalApiService } from './external-api.service';
import { ImageGeneratorService } from './image-generator.service';
import { CreateCountryDto } from '../dto/create-country.dto';

@Injectable()
export class CountriesService {
  private readonly logger = new Logger(CountriesService.name);

  constructor(
    @InjectRepository(Country)
    private countryRepository: Repository<Country>,
    private externalApiService: ExternalApiService,
    private imageGeneratorService: ImageGeneratorService, // ADD THIS
  ) { }

  async refreshCountries(): Promise<{ message: string; count: number }> {
    const [countriesData, exchangeData] = await Promise.all([
      this.externalApiService.fetchCountriesData(),
      this.externalApiService.fetchExchangeRates(),
    ]);

    const refreshTimestamp = new Date();
    let processedCount = 0;

    for (const countryData of countriesData) {
      const currencyCode = this.externalApiService.extractCurrencyCode(
        countryData.currencies || [],
      );

      let exchangeRate: number | null = null;
      let estimatedGdp: number | null = null;

      if (currencyCode) {
        exchangeRate = exchangeData.rates[currencyCode] || null;
        if (exchangeRate) {
          estimatedGdp = this.externalApiService.calculateEstimatedGdp(
            countryData.population,
            exchangeRate,
          );
        }
      }

      const countryDto: CreateCountryDto = {
        name: countryData.name,
        capital: countryData.capital,
        region: countryData.region,
        population: countryData.population,
        currencyCode: currencyCode || undefined,
        exchangeRate: exchangeRate || undefined,
        estimatedGdp: estimatedGdp || undefined,
        flagUrl: countryData.flag,
      };

      await this.upsertCountry(countryDto, refreshTimestamp);
      processedCount++;
    }

    // ADD THIS SECTION - Generate the summary image after all countries are processed
    this.logger.log(`Processed ${processedCount} countries. Generating summary image...`);

    try {
      const allCountries = await this.findAll();
      await this.imageGeneratorService.generateSummaryImage(
        allCountries,
        processedCount,
        refreshTimestamp
      );
      this.logger.log('Summary image generated successfully');
    } catch (error) {
      this.logger.error('Failed to generate summary image:', error.message);
      // Don't throw the error - we still want to return success for country refresh
    }

    return {
      message: 'Countries refreshed successfully',
      count: processedCount
    };
  }

  private async upsertCountry(
    dto: CreateCountryDto,
    refreshTimestamp: Date,
  ): Promise<void> {
    const existingCountry = await this.countryRepository.findOne({
      where: { name: ILike(dto.name) },
    });

    if (existingCountry) {
      await this.countryRepository.update(existingCountry.id, {
        ...dto,
        lastRefreshedAt: refreshTimestamp,
      });
    } else {
      const newCountry = this.countryRepository.create({
        ...dto,
        lastRefreshedAt: refreshTimestamp,
      });
      await this.countryRepository.save(newCountry);
    }
  }

  async findAll(filters?: {
    region?: string;
    currency?: string;
    sort?: string;
  }): Promise<Country[]> {
    const query = this.countryRepository.createQueryBuilder('country');

    if (filters?.region) {
      query.andWhere('country.region = :region', { region: filters.region });
    }

    if (filters?.currency) {
      query.andWhere('country.currencyCode = :currency', {
        currency: filters.currency
      });
    }

    if (filters?.sort) {
      switch (filters.sort) {
        case 'gdp_desc':
          query.orderBy('country.estimatedGdp', 'DESC');
          break;
        case 'gdp_asc':
          query.orderBy('country.estimatedGdp', 'ASC');
          break;
        case 'population_desc':
          query.orderBy('country.population', 'DESC');
          break;
        case 'population_asc':
          query.orderBy('country.population', 'ASC');
          break;
      }
    }

    return query.getMany();
  }

  async findByName(name: string): Promise<Country> {
    const country = await this.countryRepository.findOne({
      where: { name: ILike(name) },
    });

    if (!country) {
      throw new NotFoundException('Country not found');
    }

    return country;
  }

  async deleteByName(name: string): Promise<void> {
    const result = await this.countryRepository.delete({
      name: ILike(name),
    });

    if (result.affected === 0) {
      throw new NotFoundException('Country not found');
    }
  }

  async getStatus(): Promise<{
    total_countries: number;
    last_refreshed_at: Date | null;
  }> {
    const total = await this.countryRepository.count();
    const lastRefreshed = await this.countryRepository
      .createQueryBuilder('country')
      .select('MAX(country.lastRefreshedAt)', 'lastRefreshedAt')
      .getRawOne();

    return {
      total_countries: total,
      last_refreshed_at: lastRefreshed.lastRefreshedAt,
    };
  }
}