// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { CountriesModule } from './countries/countries.module';
import { StatusController } from './common/status.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        // Render provides PostgreSQL DATABASE_URL automatically
        const databaseUrl = process.env.DATABASE_URL;
        
        if (databaseUrl) {
          console.log('🚀 Using Render PostgreSQL DATABASE_URL');
          const url = new URL(databaseUrl);
          return {
            type: 'postgres', // Changed from 'mysql' to 'postgres'
            host: url.hostname,
            port: +url.port || 5432, // PostgreSQL default port
            username: url.username,
            password: url.password,
            database: url.pathname.replace('/', ''),
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: false,
            retryAttempts: 5,
            autoLoadEntities: true,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
          };
        }

        // Local development (MySQL)
        console.log('🔧 Using local MySQL development config');
        return {
          type: 'mysql',
          host: 'localhost',
          port: 3306,
          username: 'root',
          password: '',
          database: 'country_api',
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: true,
          autoLoadEntities: true,
        };
      },
    }),
    CountriesModule,
  ],
  controllers: [StatusController],
})
export class AppModule {}