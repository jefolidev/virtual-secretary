import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EnvEvolution } from './env-evolution'

@Injectable()
export class EnvEvolutionService {
  constructor(private configService: ConfigService<EnvEvolution, true>) {}

  get<T extends keyof EnvEvolution>(key: T) {
    return this.configService.get(key, { infer: true })
  }
}
