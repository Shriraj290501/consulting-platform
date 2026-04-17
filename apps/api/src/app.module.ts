import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import * as Joi from 'joi';
import { DatabaseModule } from './database/database.module';
import { CacheModule } from './cache/cache.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ServicesModule } from './modules/services/services.module';
import { CoursesModule } from './modules/courses/courses.module';
import { ConsultationsModule } from './modules/consultations/consultations.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        // Application
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        API_PORT: Joi.number().default(4000),
        FRONTEND_URL: Joi.string().uri().required(),

        // Database — Supabase dual connection strings
        DATABASE_URL: Joi.string().required(),
        DIRECT_URL: Joi.string().required(),

        // JWT — secrets must be at least 32 characters
        JWT_SECRET: Joi.string().min(32).required(),
        JWT_REFRESH_SECRET: Joi.string().min(32).required(),
        JWT_EXPIRY: Joi.string().default('15m'),
        JWT_REFRESH_EXPIRY: Joi.string().default('7d'),

        // Redis — Upstash (ioredis connection string)
        REDIS_URL: Joi.string().required(),

        // Cloudflare R2 Storage
        R2_ACCOUNT_ID: Joi.string().required(),
        R2_ACCESS_KEY_ID: Joi.string().required(),
        R2_SECRET_ACCESS_KEY: Joi.string().required(),
        R2_BUCKET_NAME: Joi.string().required(),
        R2_PUBLIC_URL: Joi.string().uri().required(),

        // Admin seed
        SEED_ADMIN_EMAIL: Joi.string().email().required(),
        SEED_ADMIN_PASSWORD: Joi.string().min(8).required(),
      }),
      validationOptions: {
        abortEarly: false,
      },
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 30,
    }]),
    DatabaseModule,
    CacheModule,
    AuthModule,
    UsersModule,
    ServicesModule,
    CoursesModule,
    ConsultationsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
