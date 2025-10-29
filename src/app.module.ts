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
        const databaseUrl = process.env.DATABASE_URL;

        if (databaseUrl && databaseUrl.includes('postgres')) {
          console.log('🚀 Using PostgreSQL');
          const url = new URL(databaseUrl);
          return {
            type: 'postgres',
            host: url.hostname,
            port: +url.port || 5432,
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

        // Fallback to MySQL (for local development)
        console.log('🔧 Using MySQL for local development');
        return {
          type: 'mysql',
          host: process.env.MYSQLHOST || 'localhost',
          port: +(process.env.MYSQLPORT || 3306),
          username: process.env.MYSQLUSER || 'root',
          password: process.env.MYSQLPASSWORD || '',
          database: process.env.MYSQLDATABASE || 'country_api',
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
export class AppModule { }