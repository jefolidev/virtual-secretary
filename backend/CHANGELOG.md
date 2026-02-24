# Changelog

## [Unreleased]

### Backend Changes

#### Banco de Dados

- Criada a tabela `appointment_reminders` para rastrear lembretes enviados.
- Adicionados novos tipos de lembretes (`D1_REMINDER`, `T2H_REMINDER`, `T30M_REMINDER`).
- Alteração na tabela para tornar o campo `type` opcional.

#### Casos de Uso

- Atualizações nos casos de uso de agendamento para gerenciar lembretes.
- Adicionado suporte para lembretes de 24h, 2h e 30 minutos antes dos compromissos.

#### Serviços

- Melhorias no processamento de lembretes no serviço do WhatsApp.
- Adicionado suporte para rastrear lembretes enviados no repositório Prisma.

#### Scripts

- Criado script de teste para verificar o funcionamento da fila de lembretes.
