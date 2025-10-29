// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CountriesModule } from './countries/countries.module';
import { StatusController } from './common/status.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        // Check for both direct env vars and ConfigService
        const host = process.env.MYSQLHOST || configService.get('MYSQLHOST') || configService.get('DB_HOST');
        const port = process.env.MYSQLPORT || configService.get('MYSQLPORT') || configService.get('DB_PORT');
        const username = process.env.MYSQLUSER || configService.get('MYSQLUSER') || configService.get('DB_USERNAME');
        const password = process.env.MYSQLPASSWORD || configService.get('MYSQLPASSWORD') || configService.get('DB_PASSWORD');
        const database = process.env.MYSQLDATABASE || configService.get('MYSQLDATABASE') || configService.get('DB_NAME');

        console.log('🔍 CHECKING ALL SOURCES:');
        console.log('MYSQLHOST:', host || 'NOT SET');
        console.log('MYSQLPORT:', port || 'NOT SET');
        console.log('MYSQLUSER:', username || 'NOT SET');
        console.log('MYSQLDATABASE:', database || 'NOT SET');
        console.log('MYSQLPASSWORD:', password ? '***SET***' : 'NOT SET');

        // Also check for DATABASE_URL as backup
        const databaseUrl = process.env.DATABASE_URL || configService.get('DATABASE_URL');
        console.log('DATABASE_URL:', databaseUrl || 'NOT SET');

        if (host && port && username && database) {
          console.log('✅ Using MySQL configuration');
          return {
            type: 'mysql',
            host,
            port: +port,
            username,
            password,
            database,
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: false,
            retryAttempts: 5,
            autoLoadEntities: true,
          };
        }

        // If we're in production but no DB config, throw error
        if (process.env.NODE_ENV === 'production') {
          throw new Error('Production database configuration is missing');
        }

        // Local development fallback
        console.log('🔧 Using local development configuration');
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
      inject: [ConfigService],
    }),
    CountriesModule,
  ],
  controllers: [StatusController],
})
export class AppModule {}