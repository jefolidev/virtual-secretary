import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './auth/auth.module'
import { envSchema } from './env/env'
import { EnvModule } from './env/env.module'
import { HttpModule } from './http/http.module'
import { OpenAIModule } from './openai/openai.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate: (env) => envSchema.parse(env),
    }),
    AuthModule,
    EnvModule,
    HttpModule,
    OpenAIModule,
  ],
})
export class AppModule {}
