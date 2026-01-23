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
]
