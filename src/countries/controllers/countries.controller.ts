// src/countries/controllers/countries.controller.ts
import {
  Controller, Get, Post, Delete, Param, Query, Res,
  HttpStatus, ParseFilePipeBuilder
} from '@nestjs/common';
import type { Response } from 'express';
import { CountriesService } from '../services/countries.service';
import { ImageGeneratorService } from '../services/image-generator.service';
import { ExternalApiService } from '../services/external-api.service';

@Controller('countries')
export class CountriesController {
  constructor(
    private readonly countriesService: CountriesService,
    private readonly imageGeneratorService: ImageGeneratorService,
    private readonly externalApiService: ExternalApiService,
  ) { }

  @Post('refresh')
  async refreshCountries() {
    return this.countriesService.refreshCountries();
  }

  @Get('image')
  async getCountryImage(@Res() res: Response) {
    if (!this.imageGeneratorService.imageExists()) {
      return res.status(404).json({ error: 'Summary image not found' });
    }

    const imagePath = this.imageGeneratorService.getImagePath();
    return res.sendFile(imagePath);
  }

  @Get()
  async getCountries(
    @Query('region') region?: string,
    @Query('currency') currency?: string,
    @Query('sort') sort?: string,
  ) {
    return this.countriesService.findAll({ region, currency, sort });
  }

  @Get(':name')
  async getCountryByName(@Param('name') name: string) {
    return this.countriesService.findByName(name);
  }

  @Delete(':name')
  async deleteCountry(@Param('name') name: string) {
    await this.countriesService.deleteByName(name);
    return { message: 'Country deleted successfully' };
  }

}