import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './auth/auth.module'
import { envSchema } from './env/env'
import { EnvModule } from './env/env.module'
import { envEvolutionSchema } from './env/evolution/env-evolution'
import { EnvEvolutionModule } from './env/evolution/env-evolution.module'
import { HttpModule } from './http/http.module'
import { WebhooksModule } from './webhooks/webhooks.module'

@Module({
  imports: [
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
    HttpModule,
    WebhooksModule,
  ],
})
export class AppModule {}
