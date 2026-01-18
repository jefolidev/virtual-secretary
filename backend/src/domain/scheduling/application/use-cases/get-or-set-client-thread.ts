import { Either, left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { NotFoundError } from '@/core/errors/resource-not-found-error'
import { UserRepository } from '../repositories/user.repository'
import { ThreadGenerator } from '../webhook/openai/thread-generator'
import { ValidationError } from './errors/validation-error'

export interface GetOrSetClientThreadUseCaseRequest {
  whatsappNumber: string
}

export type GetOrSetClientThreadUseCaseResponse = Either<
  NotFoundError | ValidationError,
  { threadId: string }
>

export class GetOrSetClientThreadUseCase {
  constructor(
    private readonly usersRepository: UserRepository,
    private readonly thread: ThreadGenerator,
  ) {}

  async execute({
    whatsappNumber,
  }: GetOrSetClientThreadUseCaseRequest): Promise<GetOrSetClientThreadUseCaseResponse> {
    const threadId = await this.usersRepository.getThreadId(whatsappNumber)

    if (threadId === null) {
      return left(new NotFoundError('User not found'))
    }

    if (threadId !== undefined) {
      return right({ threadId })
    }

    const user = await this.usersRepository.findByPhone(whatsappNumber)

    if (!user) {
      return left(new NotFoundError('User not found'))
    }

    const newThreadId = await this.thread.create()
    user.threadId = new UniqueEntityId(newThreadId)
    await this.usersRepository.save(user)

    return right({ threadId: newThreadId })
  }
}
