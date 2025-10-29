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
        // DEBUG: Log all database-related environment variables
        console.log('🔍 DATABASE ENVIRONMENT VARIABLES SCAN:');
        const dbRelatedVars = {};
        
        Object.keys(process.env).forEach(key => {
          const upperKey = key.toUpperCase();
          if (upperKey.includes('MYSQL') || 
              upperKey.includes('DB') || 
              upperKey.includes('DATABASE') ||
              upperKey.includes('TYPEORM') ||
              upperKey.includes('RAILWAY')) {
            const value = process.env[key];
            const displayValue = key.includes('PASSWORD') 
              ? (value ? '***' + value.slice(-4) : 'MISSING')
              : value || 'MISSING';
            console.log(`   ${key}: ${displayValue}`);
            dbRelatedVars[key] = value;
          }
        });

        // 1. First try DATABASE_URL (Railway often provides this)
        const databaseUrl = process.env.DATABASE_URL || configService.get('DATABASE_URL');
        if (databaseUrl) {
          console.log('🚀 Using DATABASE_URL connection string');
          try {
            const url = new URL(databaseUrl);
            return {
              type: 'mysql',
              host: url.hostname,
              port: +url.port || 3306,
              username: url.username,
              password: url.password,
              database: url.pathname.replace('/', ''),
              entities: [__dirname + '/**/*.entity{.ts,.js}'],
              synchronize: configService.get('NODE_ENV') !== 'production',
              retryAttempts: 5,
              retryDelay: 3000,
              autoLoadEntities: true,
              connectTimeout: 60000,
              acquireTimeout: 60000,
            };
          } catch (error) {
            console.error('❌ Failed to parse DATABASE_URL:', error.message);
            // Continue to individual variables
          }
        }

        // 2. Try all possible variable name combinations for Railway
        const host = 
          process.env.MYSQLHOST ||
          process.env.MYSQL_HOST ||
          process.env.DB_HOST ||
          process.env.TYPEORM_HOST ||
          process.env.RAILWAY_DB_HOST ||
          configService.get('MYSQLHOST') ||
          configService.get('MYSQL_HOST') ||
          configService.get('DB_HOST') ||
          configService.get('TYPEORM_HOST') ||
          'localhost';

        const port = 
          process.env.MYSQLPORT ||
          process.env.MYSQL_PORT ||
          process.env.DB_PORT ||
          process.env.TYPEORM_PORT ||
          process.env.RAILWAY_DB_PORT ||
          configService.get('MYSQLPORT') ||
          configService.get('MYSQL_PORT') ||
          configService.get('DB_PORT') ||
          configService.get('TYPEORM_PORT') ||
          '3306';

        const username = 
          process.env.MYSQLUSER ||
          process.env.MYSQL_USER ||
          process.env.DB_USERNAME ||
          process.env.DB_USER ||
          process.env.TYPEORM_USERNAME ||
          process.env.RAILWAY_DB_USERNAME ||
          configService.get('MYSQLUSER') ||
          configService.get('MYSQL_USER') ||
          configService.get('DB_USERNAME') ||
          configService.get('DB_USER') ||
          configService.get('TYPEORM_USERNAME') ||
          'root';

        const password = 
          process.env.MYSQLPASSWORD ||
          process.env.MYSQL_PASSWORD ||
          process.env.DB_PASSWORD ||
          process.env.TYPEORM_PASSWORD ||
          process.env.RAILWAY_DB_PASSWORD ||
          configService.get('MYSQLPASSWORD') ||
          configService.get('MYSQL_PASSWORD') ||
          configService.get('DB_PASSWORD') ||
          configService.get('TYPEORM_PASSWORD') ||
          '';

        const database = 
          process.env.MYSQLDATABASE ||
          process.env.MYSQL_DATABASE ||
          process.env.DB_NAME ||
          process.env.DB_DATABASE ||
          process.env.TYPEORM_DATABASE ||
          process.env.RAILWAY_DB_NAME ||
          configService.get('MYSQLDATABASE') ||
          configService.get('MYSQL_DATABASE') ||
          configService.get('DB_NAME') ||
          configService.get('DB_DATABASE') ||
          configService.get('TYPEORM_DATABASE') ||
          'country_api';

        console.log('🎯 FINAL DATABASE CONFIGURATION:');
        console.log('   Environment:', process.env.NODE_ENV || 'development');
        console.log('   Host:', host);
        console.log('   Port:', port);
        console.log('   Username:', username);
        console.log('   Database:', database);
        console.log('   Password present:', !!password);
        console.log('   Synchronize:', configService.get('NODE_ENV') !== 'production');

        // Validate critical configuration
        if (!host || !username || !database) {
          console.error('❌ CRITICAL: Missing required database configuration');
          console.error('   Host:', host);
          console.error('   Username:', username);
          console.error('   Database:', database);
          throw new Error('Database configuration is incomplete');
        }

        return {
          type: 'mysql',
          host,
          port: +port,
          username,
          password,
          database,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: configService.get('NODE_ENV') !== 'production',
          retryAttempts: 5,
          retryDelay: 3000,
          autoLoadEntities: true,
          connectTimeout: 60000,
          acquireTimeout: 60000,
          logging: configService.get('NODE_ENV') !== 'production' ? ['query', 'error'] : ['error'],
        };
      },
      inject: [ConfigService],
    }),
    CountriesModule,
  ],
  controllers: [StatusController],
})
export class AppModule {}