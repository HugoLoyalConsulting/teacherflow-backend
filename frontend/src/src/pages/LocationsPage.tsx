import { useState } from 'react'
import { useAppStore } from '../store/appStore'
import { Card, Badge } from '../components/UI'
import { Button, Input, Select, TextArea, Modal } from '../components/Form'
import { Trash2, Edit2, Plus, MapPin } from 'lucide-react'
import { Location } from '../types'

export const LocationsPage = () => {
  const { locations, addLocation, updateLocation, deleteLocation } = useAppStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Location>>({})

  const handleOpenModal = (location?: Location) => {
    if (location) {
      setEditingId(location.id)
      setFormData(location)
    } else {
      setEditingId(null)
      setFormData({ active: true, type: 'PARTICULAR' })
    }
    setIsModalOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.type) {
      alert('Preencha os campos obrigatórios')
      return
    }

    if (editingId) {
      updateLocation(editingId, formData)
    } else {
      const newLocation: Location = {
        id: `location-${Date.now()}`,
        tenantId: 'tenant-1',
        name: formData.name!,
        type: formData.type as Location['type'],
        unitName: formData.unitName,
        address: formData.address,
        notes: formData.notes,
        active: formData.active !== false,
      }
      addLocation(newLocation)
    }

    setIsModalOpen(false)
    setFormData({})
  }

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja deletar este local?')) {
      deleteLocation(id)
    }
  }

  const typeLabels = {
    PARTICULAR: 'Particular',
    SCHOOL: 'Escola',
    ACADEMY: 'Academia',
    CONDOMINIUM: 'Condomínio',
    ONLINE: 'Online',
  }

  const typeColors = {
    PARTICULAR: 'bg-blue-50 border-l-4 border-l-blue-500',
    SCHOOL: 'bg-purple-50 border-l-4 border-l-purple-500',
    ACADEMY: 'bg-orange-50 border-l-4 border-l-orange-500',
    CONDOMINIUM: 'bg-green-50 border-l-4 border-l-green-500',
    ONLINE: 'bg-cyan-50 border-l-4 border-l-cyan-500',
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Locais</h1>
          <p className="text-gray-600">{locations.length} local(is) cadastrado(s)</p>
        </div>
        <Button
          variant="primary"
          onClick={() => handleOpenModal()}
          icon={<Plus className="w-5 h-5" />}
        >
          Novo Local
        </Button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {locations.map((location) => (
          <Card key={location.id} className={typeColors[location.type]}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3 flex-1">
                <MapPin className="w-5 h-5 text-gray-600 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{location.name}</h3>
                  {location.unitName && <p className="text-sm text-gray-600">{location.unitName}</p>}
                </div>
              </div>
              {location.active ? (
                <Badge variant="success">Ativo</Badge>
              ) : (
                <Badge variant="danger">Inativo</Badge>
              )}
            </div>

            <Badge variant="info" className="mb-4">
              {typeLabels[location.type]}
            </Badge>

            {location.address && (
              <p className="text-sm text-gray-600 mb-2">
                📍 {location.address}
              </p>
            )}

            {location.notes && (
              <p className="text-sm text-gray-600 mb-4">
                {location.notes}
              </p>
            )}

            <div className="flex gap-2 pt-4 border-t border-gray-200">
              <button
                onClick={() => handleOpenModal(location)}
                className="flex-1 p-2 rounded-lg hover:bg-blue-100 text-blue-600 font-medium text-sm"
              >
                <Edit2 className="w-4 h-4 inline mr-2" />
                Editar
              </button>
              <button
                onClick={() => handleDelete(location.id)}
                className="flex-1 p-2 rounded-lg hover:bg-red-100 text-red-600 font-medium text-sm"
              >
                <Trash2 className="w-4 h-4 inline mr-2" />
                Deletar
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        title={editingId ? 'Editar Local' : 'Novo Local'}
        onClose={() => {
          setIsModalOpen(false)
          setFormData({})
        }}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false)
                setFormData({})
              }}
            >
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              {editingId ? 'Salvar' : 'Criar'}
            </Button>
          </>
        }
      >
        <form className="space-y-4">
          <Input
            label="Nome do Local"
            placeholder="Ex: Sala da Rua Principal"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Select
            label="Tipo"
            options={[
              { value: 'PARTICULAR', label: 'Particular' },
              { value: 'SCHOOL', label: 'Escola' },
              { value: 'ACADEMY', label: 'Academia' },
              { value: 'CONDOMINIUM', label: 'Condomínio' },
              { value: 'ONLINE', label: 'Online' },
            ]}
            value={formData.type || 'PARTICULAR'}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as Location['type'] })}
            required
          />

          <Input
            label="Unidade/Sala (Opcional)"
            placeholder="Ex: Sala 2, Bloco A"
            value={formData.unitName || ''}
            onChange={(e) => setFormData({ ...formData, unitName: e.target.value })}
          />

          <Input
            label="Endereço (Opcional)"
            placeholder="Rua, número, cidade..."
            value={formData.address || ''}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />

          <TextArea
            label="Notas"
            placeholder="Informações adicionais sobre o local..."
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
          />

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.active !== false}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <span className="font-medium">Ativo</span>
            </label>
          </div>
        </form>
      </Modal>
    </div>
  )
}
