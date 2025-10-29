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
        // Focus ONLY on DATABASE_URL
        const databaseUrl = process.env.MYSQL_URL || configService.get<string>('DATABASE_URL');
        
        console.log('🔍 DATABASE_URL CHECK:');
        console.log('DATABASE_URL:', databaseUrl || 'NOT SET');
        
        if (databaseUrl && databaseUrl.startsWith('mysql://')) {
          console.log('🚀 Using DATABASE_URL connection string');
          try {
            const url = new URL(databaseUrl);
            console.log('📊 Parsed URL:');
            console.log('   Host:', url.hostname);
            console.log('   Port:', url.port);
            console.log('   Username:', url.username);
            console.log('   Database:', url.pathname.replace('/', ''));
            
            return {
              type: 'mysql',
              host: url.hostname,
              port: +url.port || 3306,
              username: url.username,
              password: url.password,
              database: url.pathname.replace('/', ''),
              entities: [__dirname + '/**/*.entity{.ts,.js}'],
              synchronize: false,
              retryAttempts: 5,
              autoLoadEntities: true,
            };
          } catch (error) {
            console.error('❌ Failed to parse DATABASE_URL:', error.message);
            throw error;
          }
        }

        console.error('❌ No valid DATABASE_URL found');
        console.error('Current DATABASE_URL value:', databaseUrl);
        throw new Error('DATABASE_URL is required but not provided or invalid');
      },
      inject: [ConfigService],
    }),
    CountriesModule,
  ],
  controllers: [StatusController],
})
export class AppModule {}