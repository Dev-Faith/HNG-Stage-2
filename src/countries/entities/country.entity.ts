// src/countries/entities/country.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('countries')
export class Country {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  capital: string;

  @Column({ nullable: true })
  region: string;

  @Column('bigint')
  population: number;

  @Column({ name: 'currency_code', nullable: true })
  currencyCode: string;

  @Column({ name: 'exchange_rate', type: 'float', nullable: true })
  exchangeRate: number;

  @Column({ name: 'estimated_gdp', type: 'float', nullable: true })
  estimatedGdp: number;

  @Column({ name: 'flag_url', nullable: true })
  flagUrl: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'last_refreshed_at' })
  lastRefreshedAt: Date;
}