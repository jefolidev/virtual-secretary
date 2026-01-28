import { NestFactory } from '@nestjs/core'
import cookieParser from 'cookie-parser'
import { AppModule } from './app.module'
import { EnvService } from './env/env.service'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  const envService = app.get(EnvService)

  const port = envService.get('PORT')
  const corsOrigin = envService.get('CORS_ORIGIN')

  // Configurar CORS
  app.enableCors({
    origin: corsOrigin.split(',').map((origin) => origin.trim()),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })

  app.use(cookieParser())

  try {
    await app.listen(port, '0.0.0.0')
    console.log(
      `\n🚀 Aplicação NestJS iniciada com sucesso na porta: ${port}\n`,
    )
  } catch (error: unknown) {
    console.error('\n❌ ERRO FATAL AO INICIAR A APLICAÇÃO NESTJS:')
    console.error((error as Error).message)

    process.exit(1)
  }
}
bootstrap()
