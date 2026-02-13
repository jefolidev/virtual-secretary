import { UserRepository } from '@/domain/scheduling/application/repositories/user.repository'
import { Controller, Get, Query } from '@nestjs/common'
import { UserClientWhatsappPresenter } from '../presenters/user-client-whatsapp-presenter'
import { WhatsappContactPresenter } from '../presenters/whatsapp-contact-presenter'

@Controller('contacts')
export class FetchUsersContactsController {
  constructor(private readonly userRepository: UserRepository) {}

  @Get('users')
  async fetchAll(
    @Query('filter') filter?: 'all' | 'registered' | 'unregistered',
    @Query('order') order?: 'name' | 'recent' | 'more_appointments' | 'oldest',
  ) {
    const users = await this.userRepository.fetchWhatsappRegisteredAndUnlinked({
      filter,
      order,
    })

    if (!users) return []

    const presentedRegistredUsers = users.registred.map((registredUser) =>
      UserClientWhatsappPresenter.toHTTP(registredUser),
    )
    const presentedUnlinkedUsers = users.unlinked.map((unlinkedUser) =>
      WhatsappContactPresenter.toHTTP(unlinkedUser),
    )

    console.log(presentedRegistredUsers, presentedUnlinkedUsers)

    return [...presentedRegistredUsers, ...presentedUnlinkedUsers]
  }
}
