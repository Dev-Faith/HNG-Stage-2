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
        // DEBUG: Check EXACT variable names from Railway
        console.log('🔍 CHECKING RAILWAY VARIABLES:');
        console.log('MYSQLDATABASE:', process.env.MYSQLDATABASE || 'NOT SET');
        console.log('MYSQLHOST:', process.env.MYSQLHOST || 'NOT SET');
        console.log('MYSQLPASSWORD:', process.env.MYSQLPASSWORD ? '***SET***' : 'NOT SET');
        console.log('MYSQLPORT:', process.env.MYSQLPORT || 'NOT SET');
        console.log('MYSQLUSER:', process.env.MYSQLUSER || 'NOT SET');
        console.log('DATABASE_URL:', process.env.DATABASE_URL || 'NOT SET');

        // Use the EXACT variable names from Railway
        const host = process.env.MYSQLHOST;
        const port = process.env.MYSQLPORT;
        const username = process.env.MYSQLUSER;
        const password = process.env.MYSQLPASSWORD;
        const database = process.env.MYSQLDATABASE;

        // Only use Railway config if ALL variables are present
        if (host && port && username && database) {
          console.log('✅ USING RAILWAY MYSQL CONFIGURATION');
          console.log(`   Connecting to: ${username}@${host}:${port}/${database}`);

          return {
            type: 'mysql',
            host,
            port: +port,
            username,
            password,
            database,
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: false, // Always false in production
            retryAttempts: 5,
            retryDelay: 3000,
            autoLoadEntities: true,
            connectTimeout: 60000,
            acquireTimeout: 60000,
          };
        }

        // If Railway variables are missing, throw error (don't fallback locally)
        console.error('❌ MISSING RAILWAY DATABASE VARIABLES');
        console.error('Required: MYSQLHOST, MYSQLPORT, MYSQLUSER, MYSQLDATABASE');
        console.error('Found:', { host, port, username, database });

        throw new Error('Railway database configuration is incomplete. Check service connection and variable names.');
      },
      inject: [ConfigService],
    }),
    CountriesModule,
  ],
  controllers: [StatusController],
})
export class AppModule { }