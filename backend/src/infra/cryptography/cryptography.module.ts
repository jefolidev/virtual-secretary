import { Encrypter } from '@/domain/scheduling/application/cryptography/encrypter'
import { HashComparer } from '@/domain/scheduling/application/cryptography/hash-comparer'
import { HashGenerator } from '@/domain/scheduling/application/cryptography/hash-generator'
import { TokenInvalidator } from '@/domain/scheduling/application/cryptography/token-invalidator'
import { Module } from '@nestjs/common'
import { BcryptHasher } from './bycrypt-hasher'
import { InMemoryTokenInvalidator } from './in-memory-token-invalidator'
import { JwtEncrypter } from './jwt-encrypter'

@Module({
  providers: [
    {
      provide: Encrypter,
      useClass: JwtEncrypter,
    },
    {
      provide: HashComparer,
      useClass: BcryptHasher,
    },
    {
      provide: HashGenerator,
      useClass: BcryptHasher,
    },
    {
      provide: TokenInvalidator,
      useClass: InMemoryTokenInvalidator,
    },
  ],
  exports: [Encrypter, HashComparer, HashGenerator, TokenInvalidator],
})
export class CryptographyModule {}
