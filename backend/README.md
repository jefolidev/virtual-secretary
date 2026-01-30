# MVP – Secretária Virtual com IA

## 🎯 Objetivo do MVP

Entregar um sistema funcional capaz de:

- Atender clientes via WhatsApp com IA
- Cadastrar clientes
- Agendar sessões
- Integrar com Google Agenda
- Enviar lembretes automáticos
- Gerenciar status de pagamento (mínimo viável)

---

## ✅ Status Atual do Projeto (o que você já tem)

### 🤖 IA e Atendimento

- [x] Integração com OpenAI
- [x] IA respondendo mensagens
- [x] Identificação de intenção do usuário (agendar, dúvida, etc.)
- [x] Fluxo básico de atendimento
- [x] Cadastro de cliente via conversa
- [x] Agendamento via IA

👉 Isso já é o núcleo do MVP.

---

## 🧱 MVP – Funcionalidades Essenciais

### 1) WhatsApp (Core do Produto)

- [x] Receber mensagens via WhatsApp API
- [x] Enviar respostas automáticas
- [x] Fluxo de conversa controlado
- [ ] Templates oficiais do WhatsApp (Meta)
- [ ] Tratamento de erros e respostas inválidas

#### 🧪 Testes do Fluxo de Agendamento via IA

##### 🎯 Objetivo

Garantir que a IA:

- compreenda corretamente a intenção do usuário,
- colete dados necessários,
- respeite regras de negócio,
- crie agendamentos válidos,
- trate erros e ambiguidades.

##### 1) Testes de Intenção do Usuário (NLU)

###### 1.1 Identificação correta de intenção

- [x] Usuário pede para agendar explicitamente  
      Ex: "Quero marcar uma sessão"
- [ ] Usuário pede de forma indireta  
      Ex: "Tem horário amanhã?"
- [ ] Usuário fala de forma ambígua  
      Ex: "Quero ver uns horários"

✅ Resultado esperado: IA identifica intenção = `AGENDAR`.

---

###### 1.2 Diferenciação de intenções

- [ ] Cancelar vs remarcar vs agendar
- [ ] Dúvida vs agendamento
- [ ] Conversa informal vs ação real

✅ Resultado esperado: IA não confunde fluxos.

---

##### 2) Testes de Coleta de Dados

###### 2.1 Nome do cliente

- [x] Cliente informa nome completo
- [x] Cliente informa só primeiro nome
- [ ] Cliente não informa nome
- [x] Cliente informa nome inválido (emoji, números etc.)

✅ Resultado esperado:

- IA solicita dados faltantes ou inválidos.

---

###### 2.2 Modalidade da sessão

- [x] Presencial
- [x] Online
- [x] Cliente não especifica modalidade
- [x] Cliente escreve de forma ambígua  
      Ex: "Pode ser por chamada"

✅ Resultado esperado:

- IA interpreta ou pergunta novamente.

---

###### 2.3 Data e horário

- [x] Cliente informa data válida  
      Ex: "amanhã", "10/02", "sexta"
- [x] Cliente informa horário válido  
      Ex: "14h", "2 da tarde"
- [ ] Cliente informa horário fora do expediente
- [ ] Cliente informa data no passado
- [x] Cliente não informa horário

✅ Resultado esperado:

- IA valida e ajusta ou solicita nova opção.

---

##### 3) Testes de Regras de Negócio

###### 3.1 Antecedência mínima

- [x] Tentativa de agendamento com menos de 3h
- [ ] Tentativa com mais de 3h

✅ Resultado esperado:

- IA bloqueia ou aceita conforme regra.

---

###### 3.2 Conflito de horários

- [ ] Horário livre
- [ ] Horário já ocupado
- [ ] Horário parcialmente ocupado (buffer)
- [x] Múltiplos agendamentos simultâneos

✅ Resultado esperado:

- IA nunca cria conflito.

---

###### 3.3 Duração e buffer

- [ ] Sessão de 50 min + 10 min intervalo
- [ ] Tentativa de encaixe no intervalo
- [ ] Agendamento colado em outro

✅ Resultado esperado:

- IA respeita o buffer.

---

##### 4) Testes de Fluxo Conversacional

###### 4.1 Fluxo ideal (happy path)

- [ ] Cliente informa tudo corretamente
- [ ] IA confirma dados
- [ ] IA cria agendamento
- [ ] IA envia confirmação

✅ Resultado esperado:

- Agendamento criado com sucesso.

---

###### 4.2 Fluxo com erros do usuário

- [ ] Cliente muda de ideia no meio do fluxo
- [ ] Cliente responde algo fora do contexto
- [ ] Cliente demora a responder
- [ ] Cliente responde várias coisas juntas

✅ Resultado esperado:

- IA mantém contexto e corrige o fluxo.

---

###### 4.3 Fluxo interrompido

- [ ] Cliente abandona conversa
- [ ] Cliente volta depois
- [ ] Cliente tenta continuar o fluxo antigo

✅ Resultado esperado:

- IA retoma ou reinicia o fluxo corretamente.

---

##### 5) Testes de Integração Técnica

###### 5.1 Banco de dados

- [ ] Agendamento salvo no banco
- [ ] Cliente associado ao agendamento
- [ ] Dados consistentes

---

###### 5.2 Google Calendar

- [ ] Evento criado na agenda
- [ ] Link do Google Meet gerado (se online)
- [ ] Horário correto no fuso horário

---

###### 5.3 Pagamento (se aplicável)

- [ ] Agendamento sem pagamento
- [ ] Agendamento com pagamento pendente
- [ ] Agendamento confirmado após pagamento
- [ ] Agendamento cancelado por falta de pagamento

---

##### 6) Testes de Segurança e Robustez

- [ ] IA não cria agendamento sem dados mínimos
- [ ] IA não duplica agendamentos
- [ ] IA não expõe dados sensíveis
- [ ] IA não aceita comandos maliciosos
- [ ] IA não quebra com mensagens longas

---

##### 7) Critério de Aceitação do MVP

O fluxo de agendamento é considerado funcional quando:

- [ ] 95% dos casos de uso criam agendamentos válidos
- [ ] Nenhum conflito de horário é gerado
- [ ] A IA consegue recuperar fluxos quebrados
- [ ] O usuário consegue agendar sem intervenção humana

---

### 2) Agenda (Google Calendar)

- [ ] Ler disponibilidade no Google Calendar
- [ ] Criar evento automaticamente
- [ ] Evitar conflito de horários
- [ ] Gerar link do Google Meet (quando online)
- [ ] Aplicar regras de horário (buffers, duração)

⚠️ Sem isso, o sistema não é confiável.

---

### 3) Regras de Negócio (mínimo viável)

- [ ] Sessão = 50 min + 10 min intervalo
- [ ] Agendamento mínimo com 3h de antecedência
- [ ] Limite de horários por dia
- [ ] Cancelamento automático
- [ ] Remarcação automática

---

### 4) Pagamento (versão MVP simples)

- [ ] Gerar link de pagamento (PIX/cartão)
- [ ] Registrar status: pendente / pago / expirado
- [ ] Confirmar agendamento só após pagamento (opcional)
- [ ] Webhook de pagamento

💡 MVP não precisa ser complexo:  
pode começar só com status manual ou simulado.

---

### 5) Lembretes Automáticos

- [ ] Job scheduler (cron / queue)
- [ ] Lembrete D-1 (18h)
- [ ] Confirmação T-2h
- [ ] Lembrete T-30min
- [ ] Mensagem pós-sessão (NPS)

---

### 6) Banco de Dados (mínimo)

- [x] Clientes
- [x] Agendamentos
- [ ] Pagamentos
- [ ] Configurações do profissional
- [ ] Logs de mensagens

---

### 7) Painel Administrativo (MVP)

⚠️ Aqui é MVP simplificado, não SaaS completo.

- [ ] Visualizar agenda
- [ ] Visualizar clientes
- [ ] Configurar horários
- [ ] Configurar preços
- [ ] Editar mensagens automáticas

---

## 🧩 Estrutura Técnica do MVP

### Backend

- [x] API REST / Webhook WhatsApp
- [x] Integração OpenAI
- [ ] Integração Google Calendar
- [ ] Integração Pagamentos
- [ ] Jobs assíncronos (Bull, Cron, etc.)

### Infraestrutura

- [ ] Deploy (VPS, Railway, AWS, etc.)
- [ ] Banco em produção
- [ ] Variáveis de ambiente
- [ ] Monitoramento básico

---

## 🧭 Nível Atual do Seu Projeto

### 🥈 Nível 2 — MVP em construção

Você já tem:

- IA funcionando
- Fluxo de atendimento
- Cadastro de cliente
- Agendamento

Falta pra virar MVP completo:

- Google Agenda
- Lembretes automáticos
- Regras de negócio
- Pagamento (mínimo)
- Estabilidade

---

## 🚀 Próximo Passo LÓGICO (não emocional)

### Ordem certa de implementação:

1. Google Calendar ✅ (prioridade máxima)
2. Regras de horário + conflitos
3. Lembretes automáticos
4. Pagamento simples
5. Painel básico

⚠️ Se você pular essa ordem, o sistema vira gambiarra.

---

## 🧠 Visão de Produto (MVP vs SaaS)

### MVP (o que você está construindo agora)

- 1 profissional
- 1 agenda
- 1 WhatsApp
- regras fixas

### SaaS (fase futura)

- multi-profissionais
- multi-clínicas
- painel completo
- configurações dinâmicas
- métricas e relatórios

---

# 📌 Backlog MVP — Secretária Virtual (WhatsApp + IA)

## 🧠 ÉPICO 1 — Estruturar Atendimento via WhatsApp
### 🎯 Objetivo
Garantir que o sistema receba, interprete e responda mensagens via WhatsApp.

- [ ] Configurar webhook do WhatsApp API
- [ ] Receber mensagens do usuário
- [ ] Enviar mensagens automáticas
- [ ] Normalizar mensagens (texto, áudio, emojis, variações)
- [ ] Identificar intenção do usuário (agendar, cancelar, remarcar, dúvida)
- [ ] Criar fallback para mensagens não entendidas
- [ ] Registrar logs de conversas no banco

---

## 🤖 ÉPICO 2 — Implementar Fluxo de Atendimento com IA
### 🎯 Objetivo
Organizar o comportamento da IA dentro do WhatsApp.

- [ ] Definir estados da conversa (IDLE, COLETANDO_DADOS, CONFIRMANDO, FINALIZADO)
- [ ] Manter contexto da conversa por usuário
- [ ] Controlar transição de estados
- [ ] Evitar respostas fora do contexto
- [ ] Implementar regras híbridas (IA + lógica de negócio)
- [ ] Testar respostas ambíguas e fora do fluxo

---

## 📅 ÉPICO 3 — Fazer Fluxo de Agendamento
### 🎯 Objetivo
Permitir que a IA crie agendamentos válidos via conversa.

### 🧩 Subtarefas (Sprint)
- [ ] Coletar nome do cliente
- [ ] Validar nome do cliente
- [ ] Coletar modalidade (presencial/online)
- [ ] Interpretar modalidade por linguagem natural
- [ ] Coletar data desejada
- [ ] Interpretar datas naturais (amanhã, sexta, etc.)
- [ ] Coletar horário desejado
- [ ] Validar horário (expediente, formato, fuso)
- [ ] Aplicar regras de antecedência mínima (3h)
- [ ] Verificar conflito de horário no banco
- [ ] Verificar buffer entre sessões
- [ ] Oferecer até 3 opções de horário
- [ ] Confirmar dados com o usuário
- [ ] Criar agendamento no banco
- [ ] Retornar confirmação ao cliente

---

## 🗓️ ÉPICO 4 — Integrar com Google Calendar
### 🎯 Objetivo
Sincronizar agendamentos com o Google Agenda.

- [ ] Autenticar com Google Calendar API
- [ ] Buscar horários ocupados
- [ ] Criar evento no Google Calendar
- [ ] Gerar link do Google Meet (online)
- [ ] Sincronizar cancelamentos e remarcações
- [ ] Tratar conflitos entre banco e Google Agenda

---

## 🔄 ÉPICO 5 — Fazer Fluxo de Cancelamento e Remarcação
### 🎯 Objetivo
Permitir que o usuário altere agendamentos via IA.

- [ ] Identificar intenção de cancelamento
- [ ] Identificar intenção de remarcação
- [ ] Localizar agendamento do cliente
- [ ] Validar política de cancelamento
- [ ] Cancelar agendamento no banco
- [ ] Atualizar Google Calendar
- [ ] Criar novo agendamento (remarcação)
- [ ] Confirmar alteração ao cliente

---

## ⏰ ÉPICO 6 — Implementar Lembretes Automáticos
### 🎯 Objetivo
Enviar notificações automáticas via WhatsApp.

- [ ] Criar sistema de jobs (cron/queue)
- [ ] Lembrete D-1 (18h)
- [ ] Confirmação T-2h
- [ ] Lembrete T-30min
- [ ] Tratar resposta de confirmação
- [ ] Identificar no-show
- [ ] Notificar profissional

---

## 💬 ÉPICO 7 — Fazer Fluxo de Avaliação (Pós-Sessão)
### 🎯 Objetivo
Coletar feedback do cliente.

- [ ] Enviar mensagem NPS (0–10)
- [ ] Validar resposta NPS
- [ ] Solicitar comentário opcional
- [ ] Salvar avaliação no banco
- [ ] Gerar métrica de satisfação

---

## 💰 ÉPICO 8 — Implementar Fluxo de Pagamento (MVP)
### 🎯 Objetivo
Controlar status de pagamento do agendamento.

- [ ] Gerar link de pagamento (PIX/cartão)
- [ ] Registrar status (pendente, pago, expirado)
- [ ] Integrar webhook do provedor de pagamento
- [ ] Confirmar agendamento após pagamento
- [ ] Liberar horário se não pagar no prazo
- [ ] Notificar cliente e profissional

---

## 🗄️ ÉPICO 9 — Estruturar Banco de Dados
### 🎯 Objetivo
Garantir persistência de dados do sistema.

- [ ] Modelar entidades (cliente, agendamento, pagamento, mensagem)
- [ ] Criar migrations
- [ ] Implementar repositórios
- [ ] Garantir integridade de dados
- [ ] Criar logs de eventos

---

## 🧑‍💻 ÉPICO 10 — Painel Administrativo (MVP)
### 🎯 Objetivo
Permitir controle básico pelo profissional.

- [ ] Visualizar agenda
- [ ] Visualizar clientes
- [ ] Configurar horários de atendimento
- [ ] Configurar preços
- [ ] Editar mensagens automáticas
- [ ] Visualizar relatórios básicos

---

## 🧪 ÉPICO 11 — Testes do Fluxo de Agendamento (QA)
### 🎯 Objetivo
Garantir confiabilidade da IA.

- [ ] Testar intenção de agendamento
- [ ] Testar dados incompletos
- [ ] Testar horários inválidos
- [ ] Testar conflitos de agenda
- [ ] Testar ambiguidades de linguagem
- [ ] Testar abandono de conversa
- [ ] Testar retomada de fluxo
- [ ] Testar duplicidade de agendamento

---

## 🚀 ÉPICO 12 — Deploy e Estabilidade
### 🎯 Objetivo
Colocar o MVP em produção.

- [ ] Configurar ambiente de produção
- [ ] Configurar variáveis de ambiente
- [ ] Deploy do backend
- [ ] Monitoramento básico
- [ ] Logs de erros
- [ ] Backup do banco

---
