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
        // DEBUG: First, let's see what's actually available
        console.log('🔍 SCANNING FOR DATABASE VARIABLES:');
        const envVars = ['MYSQLHOST', 'MYSQLPORT', 'MYSQLUSER', 'MYSQLPASSWORD', 'MYSQLDATABASE', 'DATABASE_URL'];

        envVars.forEach(varName => {
          const value = process.env[varName];
          console.log(`   ${varName}: ${value ? 'SET' : 'NOT SET'}`);
        });

        // 1. Try DATABASE_URL first (no fallback!)
        const databaseUrl = process.env.DATABASE_URL;
        if (databaseUrl) {
          console.log('🚀 Using DATABASE_URL from process.env');
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
              synchronize: process.env.NODE_ENV !== 'production',
              retryAttempts: 5,
              retryDelay: 3000,
              autoLoadEntities: true,
            };
          } catch (error) {
            console.error('❌ Failed to parse DATABASE_URL');
          }
        }

        // 2. Check if ALL required MySQL variables are present (NO FALLBACKS!)
        const host = process.env.MYSQLHOST;
        const port = process.env.MYSQLPORT;
        const username = process.env.MYSQLUSER;
        const password = process.env.MYSQLPASSWORD;
        const database = process.env.MYSQLDATABASE;

        console.log('📊 DIRECT ENV VARIABLE CHECK:');
        console.log('   MYSQLHOST:', host || 'NOT SET');
        console.log('   MYSQLPORT:', port || 'NOT SET');
        console.log('   MYSQLUSER:', username || 'NOT SET');
        console.log('   MYSQLDATABASE:', database || 'NOT SET');
        console.log('   MYSQLPASSWORD:', password ? '***SET***' : 'NOT SET');

        // Only use MySQL vars if ALL required ones are present
        if (host && port && username && database) {
          console.log('✅ Using MYSQL* environment variables');
          return {
            type: 'mysql',
            host,
            port: +port,
            username,
            password, // password can be empty
            database,
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: process.env.NODE_ENV !== 'production',
            retryAttempts: 5,
            retryDelay: 3000,
            autoLoadEntities: true,
          };
        }

        // 3. Fallback to local development ONLY if no production vars found
        console.log('🔧 Using local development fallback');
        return {
          type: 'mysql',
          host: 'localhost',
          port: 3306,
          username: 'root',
          password: '',
          database: 'country_api',
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: true,
          retryAttempts: 3,
          retryDelay: 3000,
          autoLoadEntities: true,
        };
      },
      inject: [ConfigService],
    }),
    CountriesModule,
  ],
  controllers: [StatusController],
})
export class AppModule { }