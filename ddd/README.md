# Clientes - Regras de Negócio | Agendamentos

- Cliente deve poder criar consultas
  - Deve poder escolher modalidade (presencial, via Google Meet)
  - Deve poder escolher preferência de horário (manhã, tarde, noite)
  - Deve poder receber opções horários disponíveis
- Cliente deve poder remarcar consultas
- Cliente deve poder cancelar consultas
- Cliente deve poder visualizar seus consultas
- Cliente deve poder filtrar suas consultas por data
- Cliente deve poder visualizar histórico de consultas realizadas
- Clientes só devem poder agendar com no mínimo 3 horas e antecedência

# Profissionaiss - Regras de Negócio | Agendamentos

- Profissional deve poder visualizar suas consultas
- Profissioanl deve poder visualizar suas consultas por clientes
- Profissional deve poder determinar os minutos de suas sessões
- Profissional deve poder determinar os intervalos entre as sessões
- Profissional deve poder visualizar histórico de consultas atendidas

# Sessões - Regras de Negócio

- Sessões padrão devem durar 50 minutos (configurável pelo profissional)
- Sessões devem ter intervalos padrão de 10 minutos (configurável pelo profissional)
- Agendamento deve respeitar disponibilidade do profissional e intervalos configurados
- Cancelmaneto e remarcação devem seguir políticasx definidas
- Sistema deve registrar no-show quando cliente não comparece ou não confirma
