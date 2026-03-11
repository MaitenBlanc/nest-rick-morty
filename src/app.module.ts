import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');

        return {
          type: 'postgres',
          url: databaseUrl,
          host: databaseUrl
            ? undefined
            : configService.get('DB_HOST', 'localhost'),
          port: databaseUrl ? undefined : +configService.get('DB_PORT', 5432),
          username: databaseUrl
            ? undefined
            : configService.get('DB_USERNAME', 'postgres'),
          password: databaseUrl ? undefined : configService.get('DB_PASSWORD'),
          database: databaseUrl ? undefined : configService.get('DB_NAME'),
          autoLoadEntities: true,
          synchronize: true,
          ssl: databaseUrl ? { rejectUnauthorized: false } : false,
        };
      },
    }),
    AuthModule,
  ],
})
export class AppModule {}
