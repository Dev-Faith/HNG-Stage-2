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
        // Automatic Railway detection - try multiple variable patterns
        const host = process.env.MYSQLHOST || configService.get('MYSQLHOST') || 'localhost';
        const port = process.env.MYSQLPORT || configService.get('MYSQLPORT') || '3306';
        const username = process.env.MYSQLUSER || configService.get('MYSQLUSER') || 'root';
        const password = process.env.MYSQLPASSWORD || configService.get('MYSQLPASSWORD') || '';
        const database = process.env.MYSQLDATABASE || configService.get('MYSQLDATABASE') || 'default_db';
        
        // Debug output
        console.log('🔍 DATABASE CONFIGURATION:');
        console.log('Host:', host);
        console.log('Port:', port);
        console.log('Username:', username);
        console.log('Database:', database);
        console.log('Password present:', !!password);
        console.log('NODE_ENV:', configService.get('NODE_ENV'));
        
        return {
          type: 'mysql',
          host,
          port: +port,
          username,
          password,
          database,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: configService.get('NODE_ENV') !== 'production',
          // Better connection settings for Railway
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