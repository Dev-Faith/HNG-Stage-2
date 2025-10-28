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
        // Use direct Railway MySQL variables
        console.log('🔍 CHECKING RAILWAY VARIABLES:');
        console.log('MYSQLHOST:', process.env.MYSQLHOST);
        console.log('MYSQLPORT:', process.env.MYSQLPORT);
        console.log('MYSQLUSER:', process.env.MYSQLUSER);
        console.log('MYSQLDATABASE:', process.env.MYSQLDATABASE);
        console.log('MYSQLPASSWORD present:', !!process.env.MYSQLPASSWORD);
        
        return {
          type: 'mysql',
          host: process.env.MYSQLHOST,
          port: +configService.get('MYSQLPORT', '3306'),
          username: process.env.MYSQLUSER,
          password: process.env.MYSQLPASSWORD,
          database: process.env.MYSQLDATABASE,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: configService.get('NODE_ENV') !== 'production',
        };
      },
      inject: [ConfigService],
    }),
    CountriesModule,
  ],
  controllers: [StatusController],
})
export class AppModule {}