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
        // Universal configuration - works on Railway AND locally
        const host = 
          process.env.MYSQLHOST || 
          configService.get('MYSQLHOST') ||
          configService.get('DB_HOST') || 
          'localhost';
          
        const port = 
          process.env.MYSQLPORT || 
          configService.get('MYSQLPORT') ||
          configService.get('DB_PORT') || 
          '3306';
          
        const username = 
          process.env.MYSQLUSER || 
          configService.get('MYSQLUSER') ||
          configService.get('DB_USERNAME') || 
          'root';
          
        const password = 
          process.env.MYSQLPASSWORD || 
          configService.get('MYSQLPASSWORD') ||
          configService.get('DB_PASSWORD') || 
          '';
          
        const database = 
          process.env.MYSQLDATABASE || 
          configService.get('MYSQLDATABASE') ||
          configService.get('DB_NAME') || 
          'country_api';

        console.log('🌍 DATABASE CONFIGURATION:');
        console.log('Environment:', configService.get('NODE_ENV'));
        console.log('Host:', host);
        console.log('Port:', port);
        console.log('Username:', username);
        console.log('Database:', database);
        console.log('Password present:', !!password);
        
        return {
          type: 'mysql',
          host,
          port: +port,
          username,
          password,
          database,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: configService.get('NODE_ENV') !== 'production', // true locally, false on Railway
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
export class AppModule {}