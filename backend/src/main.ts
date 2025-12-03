import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const port = process.env.PORT || 3000

  try {
    await app.listen(port)
    console.log(
      `\n🚀 Aplicação NestJS iniciada com sucesso na porta: ${port}\n`
    )
  } catch (error) {
    // --- O BLOCO MAIS IMPORTANTE ---
    console.error('\n❌ ERRO FATAL AO INICIAR A APLICAÇÃO NESTJS:')
    console.error(error.message)
    // Para ver o erro completo, incluindo a stack trace do Prisma:
    // console.error(error);
    // -------------------------------

    // Força o processo a sair para que o "start:dev" não fique travado
    process.exit(1)
  }
}
bootstrap()
