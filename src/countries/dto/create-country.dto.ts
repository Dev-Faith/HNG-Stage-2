// src/countries/dto/create-country.dto.ts
import { IsString, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateCountryDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  capital?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsNotEmpty()
  @IsNumber()
  population: number;

  @IsOptional()
  @IsString()
  currencyCode?: string;

  @IsOptional()
  @IsNumber()
  exchangeRate?: number;

  @IsOptional()
  @IsNumber()
  estimatedGdp?: number;

  @IsOptional()
  @IsString()
  flagUrl?: string;
}