// src/common/status.controller.ts
import { Controller, Get } from '@nestjs/common';
import { CountriesService } from '../countries/services/countries.service';

@Controller('status')
export class StatusController {
  constructor(private readonly countriesService: CountriesService) {}

  @Get()
  async getStatus() {
    return this.countriesService.getStatus();
  }
}