import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useState } from 'react'

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
import { AccountDetails } from './components/account-details'
import { AddressDetails } from './components/address-details'
import { PatientPreferences } from './components/patient-preferences'
import { ProfessionalCancellation } from './components/professional-cancellation'
import { ProfessionalNotifications } from './components/professional-notifications'
import { ProfessionalScheduling } from './components/professional-scheduling'
import { UserTypeSelection } from './components/user-type-selection'
import { signupSteps } from './types/index'

export function SignUpPage() {
  const [currentStep, setCurrentStep] = useState<number>(signupSteps.USER_TYPE)
  const [userType, setUserType] = useState<'professional' | 'patient' | null>(
    null
  )

  // Estados para profissionais - notificações
  const [notifications, setNotifications] = useState({
    newAppointments: false,
    cancellations: false,
    confirmations: false,
    dailySummary: false,
    confirmedList: false,
    payments: false,
  })
  const [notificationChannels, setNotificationChannels] = useState({
    email: false,
    whatsapp: false,
  })

  // Estados para pacientes - períodos preferidos
  const [preferredTimes, setPreferredTimes] = useState<
    Array<'morning' | 'afternoon' | 'evening'>
  >([])

  const togglePreferredTime = (time: 'morning' | 'afternoon' | 'evening') => {
    setPreferredTimes((prev) =>
      prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time]
    )
  }

  // Estados para profissionais - dias de trabalho
  const [workDays, setWorkDays] = useState({
    sunday: false,
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
  })

  const toggleWorkDay = (
    day:
      | 'monday'
      | 'tuesday'
      | 'wednesday'
      | 'thursday'
      | 'friday'
      | 'saturday'
      | 'sunday'
  ) => {
    setWorkDays((prev) => ({ ...prev, [day]: !prev[day] }))
  }

  const toggleNotification = (
    key:
      | 'newAppointments'
      | 'cancellations'
      | 'confirmations'
      | 'dailySummary'
      | 'confirmedList'
  ) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const toggleNotificationChannel = (key: 'email' | 'whatsapp') => {
    setNotificationChannels((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const getTotalSteps = () => {
    if (userType === 'professional') return 6 // USER_TYPE, ACCOUNT, CANCELLATION, SCHEDULING, NOTIFICATIONS, ADDRESS
    if (userType === 'patient') return 4 // USER_TYPE, ACCOUNT, PREFERENCES, ADDRESS
    return 2 // Apenas USER_TYPE e ACCOUNT
  }

  const progress = ((currentStep + 1) / getTotalSteps()) * 100

  const canProceed = () => {
    // Etapa 1: Tipo de usuário deve estar selecionado
    if (currentStep === signupSteps.USER_TYPE) {
      return userType !== null
    }

    // Etapa 2: Detalhes da conta - sempre pode avançar
    if (currentStep === signupSteps.ACCOUNT_DETAILS) {
      return true
    }

    // Etapa 3a: Preferências do paciente (currentStep === 2 e userType === 'patient')
    if (currentStep === 2 && userType === 'patient') {
      return true
    }

    // Etapas do profissional (currentStep === 2, 3, ou 4 e userType === 'professional')
    if (
      (currentStep === 2 || currentStep === 3 || currentStep === 4) &&
      userType === 'professional'
    ) {
      return true
    }

    // Etapa final: Endereço
    if (currentStep === signupSteps.ADDRESS_DETAILS) {
      return true
    }

    return false
  }

  const getNextStep = () => {
    if (currentStep === signupSteps.USER_TYPE) {
      return signupSteps.ACCOUNT_DETAILS
    }
    if (currentStep === signupSteps.ACCOUNT_DETAILS) {
      return userType === 'patient'
        ? signupSteps.PATIENT_PREFERENCES
        : signupSteps.PROFESSIONAL_CANCELLATION
    }
    if (
      userType === 'patient' &&
      currentStep === signupSteps.PATIENT_PREFERENCES
    ) {
      return signupSteps.ADDRESS_DETAILS
    }
    if (userType === 'professional') {
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
      userType === 'patient' &&
      currentStep === signupSteps.PATIENT_PREFERENCES
    ) {
      return signupSteps.ACCOUNT_DETAILS
    }
    if (userType === 'professional') {
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
      return userType === 'patient'
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

  const handleSubmit = () => {
    console.log('Formulário finalizado', { userType })
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
            {/* Etapa 1: Tipo de Usuário */}
            {currentStep === signupSteps.USER_TYPE && (
              <UserTypeSelection
                userType={userType}
                onSelectUserType={setUserType}
              />
            )}

            {/* Etapa 2: Detalhes da Conta */}
            {currentStep === signupSteps.ACCOUNT_DETAILS && <AccountDetails />}

            {/* Etapa 3a: Preferências do Paciente */}
            {currentStep === signupSteps.PATIENT_PREFERENCES &&
              userType === 'patient' && (
                <PatientPreferences
                  preferredTimes={preferredTimes}
                  onToggleTime={togglePreferredTime}
                />
              )}

            {/* Etapa 3b: Política de Cancelamento (Profissional) */}
            {currentStep === signupSteps.PROFESSIONAL_CANCELLATION &&
              userType === 'professional' && <ProfessionalCancellation />}

            {/* Etapa 4: Configurações de Agendamento (Profissional) */}
            {currentStep === signupSteps.PROFESSIONAL_SCHEDULING &&
              userType === 'professional' && (
                <ProfessionalScheduling
                  workDays={workDays}
                  onToggleWorkDay={toggleWorkDay}
                />
              )}

            {/* Etapa 5: Notificações (Profissional) */}
            {currentStep === signupSteps.PROFESSIONAL_NOTIFICATIONS &&
              userType === 'professional' && (
                <ProfessionalNotifications
                  notifications={notifications}
                  notificationChannels={notificationChannels}
                  onToggleNotification={toggleNotification}
                  onToggleNotificationChannel={toggleNotificationChannel}
                />
              )}

            {/* Etapa Final: Endereço */}
            {currentStep === signupSteps.ADDRESS_DETAILS && <AddressDetails />}
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
