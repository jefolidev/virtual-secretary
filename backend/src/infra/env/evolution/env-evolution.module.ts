import { Module } from '@nestjs/common'
import { EnvEvolutionService } from './env-evolution.service'

@Module({
  providers: [EnvEvolutionService],
  exports: [EnvEvolutionService],
})
export class EnvEvolutionModule {}
