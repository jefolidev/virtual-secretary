# Componentes de Cadastro

Esta pasta contém todos os componentes utilizados no fluxo de cadastro da aplicação.

## Estrutura

Cada componente está organizado em sua própria pasta seguindo o padrão:

```
ComponentName/
  └── index.tsx
```

## Componentes Disponíveis

### UserTypeSelection

Tela inicial onde o usuário escolhe se é profissional ou paciente.

**Props:**

- `userType`: Tipo de usuário selecionado ('professional' | 'patient' | null)
- `onSelectUserType`: Função callback para selecionar o tipo de usuário

---

### AccountDetails

Formulário com os dados básicos da conta (nome, email, senha, telefone, CPF, data de nascimento).

**Props:** Nenhuma (componente stateless)

---

### PatientPreferences

Preferências de consulta para pacientes (períodos preferidos, especialidade, tipo de atendimento).

**Props:**

- `preferredTimes`: Array com os períodos selecionados
- `onToggleTime`: Função callback para alternar períodos

---

### ProfessionalCancellation

Configurações de política de cancelamento para profissionais.

**Props:** Nenhuma (componente stateless)

---

### ProfessionalScheduling

Configurações de agendamento para profissionais (dias de trabalho, horários, duração).

**Props:**

- `workDays`: Objeto com os dias da semana selecionados
- `onToggleWorkDay`: Função callback para alternar dias de trabalho

---

### ProfessionalNotifications

Configurações de notificações para profissionais.

**Props:**

- `notifications`: Objeto com tipos de notificações habilitadas
- `notificationChannels`: Objeto com canais de notificação habilitados
- `onToggleNotification`: Função callback para alternar notificações
- `onToggleNotificationChannel`: Função callback para alternar canais

---

### AddressDetails

Formulário com informações de endereço (CEP, rua, número, complemento, cidade, estado).

**Props:** Nenhuma (componente stateless)

## Uso

Todos os componentes são importados e utilizados no arquivo principal `signup/index.tsx` conforme o fluxo de cadastro multi-etapas.
