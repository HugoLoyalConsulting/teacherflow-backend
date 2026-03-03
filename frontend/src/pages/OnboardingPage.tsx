import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Button } from '../components/Form'
import { Card } from '../components/UI'

export function OnboardingPage() {
  const navigate = useNavigate()
  const { user, setUser } = useAuthStore()
  const [selectedLessonTypes, setSelectedLessonTypes] = useState<string[]>([])

  const lessonTypes = [
    { id: 'individual', label: 'Aulas Individuais', description: 'Atendimento personalizado' },
    { id: 'group', label: 'Aulas em Grupo', description: 'Turmas com múltiplos alunos' },
    { id: 'online', label: 'Aulas Online', description: 'Ensino à distância' },
    { id: 'presencial', label: 'Aulas Presenciais', description: 'Ensino no local' },
  ]

  const toggleLessonType = (id: string) => {
    setSelectedLessonTypes(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    )
  }

  const handleComplete = () => {
    if (user) {
      setUser({ ...user, onboardingComplete: true })
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-2">
              Bem-vindo ao TeacherFlow! 🎓
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Vamos configurar sua experiência. Que tipo de aulas você oferece?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lessonTypes.map(type => (
              <button
                key={type.id}
                onClick={() => toggleLessonType(type.id)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  selectedLessonTypes.includes(type.id)
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                <h3 className="font-semibold text-gray-900 dark:text-gray-50 mb-1">
                  {type.label}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {type.description}
                </p>
              </button>
            ))}
          </div>

          <div className="flex justify-between items-center pt-4">
            <p className="text-sm text-gray-500">
              Você pode mudar isso depois nas configurações
            </p>
            <Button
              onClick={handleComplete}
              disabled={selectedLessonTypes.length === 0}
            >
              Continuar
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
