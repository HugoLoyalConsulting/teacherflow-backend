import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Clock, Users } from 'lucide-react'
import { Button } from '../components/Form'
import { Card } from '../components/UI'

interface Package {
  id: string
  name: string
  description: string | null
  lesson_count: number
  duration_minutes: number
  price_brl: string
  discount_percentage: string
  validity_days: number | null
  is_active: boolean
  is_featured: boolean
  features: string[]
  created_at: string
}

export function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Load packages from API
    // For now, just set loading to false
    setTimeout(() => {
      setLoading(false)
      setPackages([])
    }, 500)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">Carregando pacotes...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">
          Pacotes de Aulas
        </h1>
        <Button onClick={() => {}} className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Novo Pacote
        </Button>
      </div>

      {packages.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Você ainda não criou nenhum pacote de aulas.
            </p>
            <Button onClick={() => {}}>
              Criar Primeiro Pacote
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <Card key={pkg.id} className={!pkg.is_active ? 'opacity-60' : ''}>
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                      {pkg.name}
                    </h3>
                    {pkg.is_featured && (
                      <span className="inline-block mt-1 px-2 py-1 text-xs font-semibold bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded">
                        Destaque
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {/* TODO: Edit */}}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {/* TODO: Delete */}}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Description */}
                {pkg.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {pkg.description}
                  </p>
                )}

                {/* Details */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <Users className="w-4 h-4" />
                    <span>{pkg.lesson_count} aulas</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <Clock className="w-4 h-4" />
                    <span>{pkg.duration_minutes} min cada</span>
                  </div>
                  {pkg.validity_days && (
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <Clock className="w-4 h-4" />
                      <span>Validade: {pkg.validity_days} dias</span>
                    </div>
                  )}
                </div>

                {/* Price */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                      R$ {Number(pkg.price_brl).toFixed(2)}
                    </span>
                    {Number(pkg.discount_percentage) > 0 && (
                      <span className="text-sm text-green-600 dark:text-green-400 font-semibold">
                        -{pkg.discount_percentage}%
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    R$ {(Number(pkg.price_brl) / pkg.lesson_count).toFixed(2)} por aula
                  </p>
                </div>

                {/* Status */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                    pkg.is_active
                      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                  }`}>
                    {pkg.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
