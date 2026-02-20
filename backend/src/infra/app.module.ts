import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { AuthModule } from './auth/auth.module'
import { envSchema } from './env/env'
import { EnvModule } from './env/env.module'
import { envEvolutionSchema } from './env/evolution/env-evolution'
import { EnvEvolutionModule } from './env/evolution/env-evolution.module'
import { EventsModule } from './events/events.module'
import { HttpModule } from './http/http.module'
import { WebhooksModule } from './webhooks/webhooks.module'

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: Number(configService.get<number>('REDIS_PORT', 6379)),
        },
      }),
      inject: [ConfigService],
    }),

    BullModule.registerQueue({
      name: 'whatsapp-reminders',
    }),

    // Configuração principal (.env)
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate: (env) => envSchema.parse(env),
    }),
    // Configuração Evolution (.env.evolution)
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.evolution',
      validate: (env) => envEvolutionSchema.parse(env),
      cache: true,
    }),
    AuthModule,
    EnvModule,
    EnvEvolutionModule,
    EventsModule,
    HttpModule,
    WebhooksModule,
  ],
})
export class AppModule {}
