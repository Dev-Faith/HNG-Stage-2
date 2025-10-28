// src/countries/countries.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CountriesController } from './controllers/countries.controller';
import { CountriesService } from './services/countries.service';
import { ExternalApiService } from './services/external-api.service';
import { ImageGeneratorService } from './services/image-generator.service';
import { Country } from './entities/country.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Country])],
  controllers: [CountriesController],
  providers: [CountriesService, ExternalApiService, ImageGeneratorService],
  exports: [CountriesService],
})
export class CountriesModule {}