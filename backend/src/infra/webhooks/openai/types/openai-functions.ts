import OpenAI from 'openai'

export const openAiFunctions: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'create_client_account',
      description:
        'Cria o cadastro do cliente com informações pessoais e de endereço.',
      parameters: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Nome completo do cliente',
          },
          email: {
            type: 'string',
            description: 'Endereço de e-mail do cliente',
          },
          cpf: {
            type: 'string',
            description: 'CPF do cliente (apenas números)',
          },
          birthDate: {
            type: 'string',
            description: 'Data de nascimento no formato DD/MM/AAAA',
          },
          gender: {
            type: 'string',
            description: 'Sexo do cliente',
            enum: ['MALE', 'FEMALE'],
          },
          cep: {
            type: 'string',
            description: 'CEP do endereço (apenas números)',
          },
          number: {
            type: 'string',
            description: 'Número do endereço residencial',
          },
          complement: {
            type: 'string',
            description: 'Complemento do endereço (opcional)',
          },
          periodPreference: {
            type: 'array',
            description: 'Períodos de preferência do cliente',
            items: {
              type: 'string',
              enum: ['MORNING', 'AFTERNOON', 'EVENING'],
            },
          },
        },
        required: [
          'name',
          'email',
          'cpf',
          'birthDate',
          'gender',
          'cep',
          'number',
          'periodPreference',
        ],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'list_professionals',
      description: 'Lista terapeutas disponíveis com paginação',
      parameters: {
        type: 'object',
        properties: {
          page: {
            type: 'number',
            description: 'Página da listagem (opcional, padrão: 1)',
          },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'schedule_appointment',
      description:
        'Agenda uma consulta terapêutica. Deve ser chamada apenas se o usuário estiver autenticado',
      strict: false,
      parameters: {
        type: 'object',
        properties: {
          professionalId: {
            type: 'string',
            description: 'ID do terapeuta',
          },
          startDateTime: {
            type: 'string',
            description: 'Data e hora da consulta no formato ISO',
          },
          modality: {
            type: 'string',
            enum: ['REMOTE', 'PRESENTIAL'],
            description: 'Modalidade da consulta',
          },
        },
        required: ['professionalId', 'startDateTime'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_appointment_details',
      description:
        'DEVE ser chamada sempre que o usuário informar QUALQUER dado (profissional, data, hora ou modalidade). Se o usuário informou vários dados na mesma frase, inclua TODOS nos argumentos.',
      parameters: {
        type: 'object',
        properties: {
          professional: {
            type: 'string',
            description: 'Nome do profissional escolhido',
          },
          datetime: {
            type: 'string',
            description:
              "Data e hora no formato ISO. Calcule com base na DATA ATUAL fornecida no sistema. Ex: Se hoje é 28/01/2026, 'amanhã as 10h' é '2026-01-29T10:00:00'",
          },
          modality: { type: 'string', enum: ['presencial', 'online'] },
        },
      },
    },
  },
]
