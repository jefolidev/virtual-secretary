import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { EnvService } from './env/env.service'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  const envService = app.get(EnvService)

  const port = envService.get('PORT')

  try {
    await app.listen(port)
    console.log(
      `\n🚀 Aplicação NestJS iniciada com sucesso na porta: ${port}\n`
    )
  } catch (error) {
    console.error('\n❌ ERRO FATAL AO INICIAR A APLICAÇÃO NESTJS:')
    console.error(error.message)

    process.exit(1)
  }
}
bootstrap()
