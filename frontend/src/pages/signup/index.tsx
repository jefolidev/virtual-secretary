import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ValidationErrorDisplay } from '@/components/validation-error-display'
import { useAuth, type SignupData } from '@/contexts/auth-context'
import {
  checkDataAvailability,
  getConflictMessage,
} from '@/services/validation'
import { validateSignupData } from '@/utils/validation'
import { AccountDetails } from './components/account-details'
import { AddressDetails } from './components/address-details'
import { PatientPreferences } from './components/patient-preferences'
import { ProfessionalCancellation } from './components/professional-cancellation'
import { ProfessionalNotifications } from './components/professional-notifications'
import { ProfessionalScheduling } from './components/professional-scheduling'
import { UserTypeSelection } from './components/user-type-selection'
import { SignupFormProvider, useSignupForm } from './contexts/form-context'
import { signupSteps } from './types/index'

export function SignUpPage() {
  return (
    <SignupFormProvider>
      <SignUpPageContent />
    </SignupFormProvider>
  )
}

function SignUpPageContent() {
  const navigate = useNavigate()
  const { signup } = useAuth()
  const { formData } = useSignupForm()
  const [currentStep, setCurrentStep] = useState<number>(signupSteps.USER_TYPE)
  const [isSuccess, setIsSuccess] = useState(false)
  const [countdown, setCountdown] = useState(5)
  const [validationErrors, setValidationErrors] = useState<any[]>([])
  const [isAccountDetailsValid, setIsAccountDetailsValid] = useState(false)
  const [isPatientPreferencesValid, setIsPatientPreferencesValid] =
    useState(false)
  const [isAddressDetailsValid, setIsAddressDetailsValid] = useState(false)
  const [isProfessionalSchedulingValid, setIsProfessionalSchedulingValid] =
    useState(false)
  const [
    isProfessionalNotificationsValid,
    setIsProfessionalNotificationsValid,
  ] = useState(false)

  useEffect(() => {
    if (isSuccess && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (isSuccess && countdown === 0) {
      navigate('/login')
    }
  }, [isSuccess, countdown, navigate])

  const getTotalSteps = () => {
    if (formData.userType === 'professional') return 6
    if (formData.userType === 'patient') return 4
    return 2
  }

  const progress = ((currentStep + 1) / getTotalSteps()) * 100

  const canProceed = () => {
    if (currentStep === signupSteps.USER_TYPE) {
      return formData.userType !== null
    }
    if (currentStep === signupSteps.ACCOUNT_DETAILS) {
      return isAccountDetailsValid
    }
    if (currentStep === 2 && formData.userType === 'patient') {
      return isPatientPreferencesValid
    }
    if (currentStep === 2 && formData.userType === 'professional') {
      return true
    }
    if (currentStep === 3 && formData.userType === 'professional') {
      return isProfessionalSchedulingValid
    }
    if (currentStep === 4 && formData.userType === 'professional') {
      return isProfessionalNotificationsValid
    }
    if (currentStep === signupSteps.ADDRESS_DETAILS) {
      return isAddressDetailsValid
    }
    return false
  }

  const getNextStep = () => {
    if (currentStep === signupSteps.USER_TYPE) {
      return signupSteps.ACCOUNT_DETAILS
    }
    if (currentStep === signupSteps.ACCOUNT_DETAILS) {
      return formData.userType === 'patient'
        ? signupSteps.PATIENT_PREFERENCES
        : signupSteps.PROFESSIONAL_CANCELLATION
    }
    if (
      formData.userType === 'patient' &&
      currentStep === signupSteps.PATIENT_PREFERENCES
    ) {
      return signupSteps.ADDRESS_DETAILS
    }
    if (formData.userType === 'professional') {
      if (currentStep === signupSteps.PROFESSIONAL_CANCELLATION) {
        return signupSteps.PROFESSIONAL_SCHEDULING
      }
      if (currentStep === signupSteps.PROFESSIONAL_SCHEDULING) {
        return signupSteps.PROFESSIONAL_NOTIFICATIONS
      }
      if (currentStep === signupSteps.PROFESSIONAL_NOTIFICATIONS) {
        return signupSteps.ADDRESS_DETAILS
      }
    }
    return currentStep
  }

  const getPreviousStep = () => {
    if (currentStep === signupSteps.ACCOUNT_DETAILS) {
      return signupSteps.USER_TYPE
    }
    if (
      formData.userType === 'patient' &&
      currentStep === signupSteps.PATIENT_PREFERENCES
    ) {
      return signupSteps.ACCOUNT_DETAILS
    }
    if (formData.userType === 'professional') {
      if (currentStep === signupSteps.PROFESSIONAL_CANCELLATION) {
        return signupSteps.ACCOUNT_DETAILS
      }
      if (currentStep === signupSteps.PROFESSIONAL_SCHEDULING) {
        return signupSteps.PROFESSIONAL_CANCELLATION
      }
      if (currentStep === signupSteps.PROFESSIONAL_NOTIFICATIONS) {
        return signupSteps.PROFESSIONAL_SCHEDULING
      }
    }
    if (currentStep === signupSteps.ADDRESS_DETAILS) {
      return formData.userType === 'patient'
        ? signupSteps.PATIENT_PREFERENCES
        : signupSteps.PROFESSIONAL_NOTIFICATIONS
    }
    return currentStep
  }

  const handleNext = () => {
    if (canProceed()) {
      const nextStep = getNextStep()
      if (nextStep !== currentStep) {
        setCurrentStep(nextStep)
      }
    }
  }

  const handlePrevious = () => {
    const prevStep = getPreviousStep()
    if (prevStep !== currentStep) {
      setCurrentStep(prevStep)
    }
  }

  const handleSubmit = async () => {
    try {
      // Limpa erros anteriores
      setValidationErrors([])

      // 1️⃣ VALIDAÇÃO DE FORMATO (campos obrigatórios, CPF, etc.)
      const validation = validateSignupData(formData as SignupData)

      if (!validation.isValid) {
        setValidationErrors(validation.errors)
        // Scroll para o topo para mostrar os erros
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }

      // 2️⃣ VALIDAÇÃO DE DADOS ÚNICOS (email, CPF, telefone duplicados)
      console.log('🔍 Verificando se dados estão disponíveis...')
      toast.loading('Verificando dados...', { id: 'checking' })

      const availability = await checkDataAvailability({
        email: formData.email,
        cpf: formData.cpf,
        phone: formData.phone,
      })

      toast.dismiss('checking')

      if (!availability.available) {
        const conflictMsg = getConflictMessage(availability.conflicts)
        toast.error('🚫 Dados já cadastrados!', {
          description: conflictMsg,
        })
        return
      }

      console.log('✅ Dados disponíveis! Prosseguindo com cadastro...')

      const signupData: SignupData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        phone: formData.phone,
        cpf: formData.cpf,
        birthdate: formData.birthdate,
        userType: formData.userType || 'patient',
        periodPreference:
          formData.userType === 'patient' ? formData.periodPreference : [],
        extraPreferences:
          formData.userType === 'patient' ? formData.extraPreferences : '',
        workDays:
          formData.userType === 'professional' ? formData.workDays : undefined,
        appointmentDuration:
          formData.userType === 'professional'
            ? formData.appointmentDuration
            : undefined,
        breakTime:
          formData.userType === 'professional' ? formData.breakTime : undefined,
        startTime:
          formData.userType === 'professional' ? formData.startTime : undefined,
        endTime:
          formData.userType === 'professional' ? formData.endTime : undefined,
        cancellationPolicy:
          formData.userType === 'professional'
            ? formData.cancellationPolicy
            : undefined,
        notifications:
          formData.userType === 'professional'
            ? {
                newAppointments: formData.notifications.newAppointments,
                cancellations: formData.notifications.cancellations,
                confirmations: formData.notifications.confirmations,
                dailySummary: formData.notifications.dailySummary,
                confirmedList: formData.notifications.confirmedList,
              }
            : undefined,
        notificationChannels:
          formData.userType === 'professional'
            ? formData.notificationChannels
            : undefined,
        address: formData.address,
      }

      console.log('🚀 Debug SignupData antes do envio:')
      console.log('  - userType:', signupData.userType)
      console.log('  - periodPreference:', signupData.periodPreference)
      console.log('  - extraPreferences:', signupData.extraPreferences)
      console.log('  - formData.periodPreference:', formData.periodPreference)
      console.log('  - Complete signupData:', signupData)

      await signup(signupData)
      setIsSuccess(true)
      toast.success('🎉 Cadastro realizado com sucesso!', {
        description: 'Você será redirecionado para o login em instantes.',
      })
    } catch (error: any) {
      console.error('Erro ao cadastrar:', error)

      // Se for um erro de validação, a mensagem já foi tratada no auth context
      if (error instanceof Error && error.name === 'ValidationError') {
        return
      }

      // Tratamento específico para diferentes tipos de erro
      if (error?.response?.status === 409) {
        toast.error('🚫 Dados já cadastrados!', {
          description:
            'Este email, CPF ou telefone já está em uso. Tente fazer login ou use outros dados.',
        })
      } else if (error?.response?.status === 500) {
        // Verifica se é um erro de dados duplicados (mesmo com status 500)
        const errorMessage = error?.response?.data?.message || ''
        const errorDetails = JSON.stringify(error?.response?.data || {})

        if (
          errorDetails.includes('duplicate') ||
          errorDetails.includes('unique') ||
          errorDetails.includes('phone') ||
          errorDetails.includes('email') ||
          errorDetails.includes('cpf') ||
          errorMessage.includes('already exists') ||
          errorDetails.includes('P2002') ||
          errorDetails.includes('UniqueConstraintViolation')
        ) {
          toast.error('🚫 Dados já cadastrados!', {
            description:
              'Este email, CPF ou telefone já está em uso. Tente outros dados.',
          })
        } else {
          toast.error('🔧 Erro no servidor', {
            description:
              'Problema temporário em nossos serviços. Tente novamente em alguns minutos.',
          })
        }
      } else if (
        error?.response?.status >= 400 &&
        error?.response?.status < 500
      ) {
        toast.error('❌ Dados inválidos', {
          description:
            error?.response?.data?.message ||
            'Verifique os dados informados e tente novamente.',
        })
      } else {
        toast.error('💥 Erro inesperado', {
          description:
            'Algo deu errado. Verifique sua conexão e tente novamente.',
        })
      }
    }
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case signupSteps.USER_TYPE:
        return 'Tipo de Usuário'
      case signupSteps.ACCOUNT_DETAILS:
        return 'Detalhes da Conta'
      case signupSteps.PATIENT_PREFERENCES:
        return 'Preferências de Consulta'
      case signupSteps.PROFESSIONAL_CANCELLATION:
        return 'Política de Cancelamento'
      case signupSteps.PROFESSIONAL_SCHEDULING:
        return 'Configurações de Agendamento'
      case signupSteps.PROFESSIONAL_NOTIFICATIONS:
        return 'Configurações de Notificações'
      case signupSteps.ADDRESS_DETAILS:
        return 'Endereço'
      default:
        return ''
    }
  }

  const getStepDescription = () => {
    switch (currentStep) {
      case signupSteps.USER_TYPE:
        return 'Selecione como você deseja se cadastrar na Mindly.'
      case signupSteps.ACCOUNT_DETAILS:
        return 'Preencha seus dados pessoais e de acesso.'
      case signupSteps.PATIENT_PREFERENCES:
        return 'Informe suas preferências para agendamento de consultas.'
      case signupSteps.PROFESSIONAL_CANCELLATION:
        return 'Defina suas políticas de cancelamento.'
      case signupSteps.PROFESSIONAL_SCHEDULING:
        return 'Configure seus horários de atendimento.'
      case signupSteps.PROFESSIONAL_NOTIFICATIONS:
        return 'Escolha como deseja ser notificado.'
      case signupSteps.ADDRESS_DETAILS:
        return 'Informe seu endereço.'
      default:
        return ''
    }
  }

  const isLastStep = () => {
    return currentStep === signupSteps.ADDRESS_DETAILS
  }

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">
                  Cadastro realizado com sucesso! 🎉
                </h2>
                <p className="text-gray-600">
                  Seja bem-vindo(a) à Mindly! Seu cadastro foi concluído e você
                  já pode fazer login para começar a usar nossa plataforma.
                </p>
              </div>
              <div className="w-full rounded-lg bg-gray-50 p-4">
                <p className="text-sm text-gray-600">
                  Você será redirecionado para a tela de login em{' '}
                  <span className="font-bold text-gray-900">{countdown}</span>{' '}
                  {countdown === 1 ? 'segundo' : 'segundos'}...
                </p>
              </div>
              <Button
                onClick={() => navigate('/login')}
                className="w-full"
                size="lg"
              >
                Ir para o Login agora
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>
              Etapa {currentStep + 1} de {getTotalSteps()}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{getStepTitle()}</CardTitle>
            <CardDescription>{getStepDescription()}</CardDescription>
          </CardHeader>

          <CardContent className="py-6">
            {/* Exibição de erros de validação */}
            {validationErrors.length > 0 && (
              <ValidationErrorDisplay errors={validationErrors} />
            )}

            {/* Etapa 1: Tipo de Usuário */}
            {currentStep === signupSteps.USER_TYPE && <UserTypeSelection />}

            {/* Etapa 2: Detalhes da Conta */}
            {currentStep === signupSteps.ACCOUNT_DETAILS && (
              <AccountDetails onValidationChange={setIsAccountDetailsValid} />
            )}

            {/* Etapa 3a: Preferências do Paciente */}
            {currentStep === signupSteps.PATIENT_PREFERENCES &&
              formData.userType === 'patient' && (
                <PatientPreferences
                  onValidationChange={setIsPatientPreferencesValid}
                />
              )}

            {/* Etapa 3b: Política de Cancelamento (Profissional) */}
            {currentStep === signupSteps.PROFESSIONAL_CANCELLATION &&
              formData.userType === 'professional' && (
                <ProfessionalCancellation />
              )}

            {/* Etapa 4: Configurações de Agendamento (Profissional) */}
            {currentStep === signupSteps.PROFESSIONAL_SCHEDULING &&
              formData.userType === 'professional' && (
                <ProfessionalScheduling
                  onValidationChange={setIsProfessionalSchedulingValid}
                  workDays={formData.workDays}
                  onToggleWorkDay={(_day) => {
                    // Implementation needed based on your form context
                  }}
                />
              )}

            {/* Etapa 5: Notificações (Profissional) */}
            {currentStep === signupSteps.PROFESSIONAL_NOTIFICATIONS &&
              formData.userType === 'professional' && (
                <ProfessionalNotifications
                  notifications={formData.notifications}
                  notificationChannels={formData.notificationChannels}
                  onToggleNotification={(_key) => {
                    // Implementation needed based on your form context
                  }}
                  onToggleNotificationChannel={(_channel) => {
                    // Implementation needed based on your form context
                  }}
                  onValidationChange={setIsProfessionalNotificationsValid}
                />
              )}

            {/* Etapa Final: Endereço */}
            {currentStep === signupSteps.ADDRESS_DETAILS && (
              <AddressDetails onValidationChange={setIsAddressDetailsValid} />
            )}
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === signupSteps.USER_TYPE}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>

            {isLastStep() ? (
              <Button onClick={handleSubmit} disabled={!canProceed()}>
                Finalizar Cadastro
              </Button>
            ) : (
              <Button onClick={handleNext} disabled={!canProceed()}>
                Próximo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
