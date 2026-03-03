import { useState } from 'react'
import { useAppStore } from '../store/appStore'
import { Card, Badge } from '../components/UI'
import { Button, Input, Select, Modal } from '../components/Form'
import { Trash2, Edit2, Plus, Users } from 'lucide-react'
import { Group } from '../types'
import { formatCurrencyBR } from '../utils/formatters'

export const GroupsPage = () => {
  const { groups, locations, addGroup, updateGroup, deleteGroup } = useAppStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Group>>({})

  const handleOpenModal = (group?: Group) => {
    if (group) {
      setEditingId(group.id)
      setFormData(group)
    } else {
      setEditingId(null)
      if (locations.length > 0) {
        setFormData({ active: true, locationId: locations[0]?.id || '' })
      } else {
        setFormData({ active: true, locationId: '' })
      }
    }
    setIsModalOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.locationId || !formData.capacity || !formData.defaultPricePerStudent) {
      alert('Preencha todos os campos obrigatórios')
      return
    }

    if (editingId) {
      updateGroup(editingId, formData)
    } else {
      const newGroup: Group = {
        id: `group-${Date.now()}`,
        tenantId: 'tenant-1',
        name: formData.name!,
        locationId: formData.locationId!,
        capacity: formData.capacity!,
        defaultPricePerStudent: formData.defaultPricePerStudent!,
        active: formData.active !== false,
      }
      addGroup(newGroup)
    }

    setIsModalOpen(false)
    setFormData({})
  }

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja deletar esta turma?')) {
      deleteGroup(id)
    }
  }

  const getLocationName = (locationId: string) => {
    return locations.find((l) => l.id === locationId)?.name || 'Local desconhecido'
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Turmas</h1>
          <p className="text-gray-600">{groups.length} turma(s) cadastrada(s)</p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            if (locations.length === 0) {
              alert('Você precisa cadastrar pelo menos um local antes de criar uma turma.')
              return
            }
            handleOpenModal()
          }}
          icon={<Plus className="w-5 h-5" />}
        >
          Nova Turma
        </Button>
      </div>

      {locations.length === 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-blue-800 dark:text-blue-200">
            ℹ️ Você precisa cadastrar <strong>locais</strong> antes de criar turmas. {' '}
            <a href="/" className="underline font-semibold hover:text-blue-900 dark:hover:text-blue-100">
              Cadastre um local
            </a>
          </p>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <Card
            key={group.id}
            className={`${group.active ? 'border-l-4 border-l-green-500 bg-green-50' : 'border-l-4 border-l-gray-300 bg-gray-50'}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3 flex-1">
                <Users className="w-5 h-5 text-gray-600 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{group.name}</h3>
                  <p className="text-sm text-gray-600">{getLocationName(group.locationId)}</p>
                </div>
              </div>
              {group.active ? (
                <Badge variant="success">Ativa</Badge>
              ) : (
                <Badge variant="danger">Inativa</Badge>
              )}
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Capacidade</span>
                <Badge variant="info">{group.capacity} alunos</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Valor por Aluno</span>
                <span className="font-bold text-green-600">{formatCurrencyBR(group.defaultPricePerStudent)}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-gray-200">
              <button
                onClick={() => handleOpenModal(group)}
                className="flex-1 p-2 rounded-lg hover:bg-blue-100 text-blue-600 font-medium text-sm"
              >
                <Edit2 className="w-4 h-4 inline mr-2" />
                Editar
              </button>
              <button
                onClick={() => handleDelete(group.id)}
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
        title={editingId ? 'Editar Turma' : 'Nova Turma'}
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
            label="Nome da Turma"
            placeholder="Ex: Turma A - Infantil"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Select
            label="Local"
            options={locations.map((l) => ({ value: l.id, label: l.name }))}
            value={formData.locationId || ''}
            onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
            emptyMessage="Nenhum local cadastrado"
            required
          />

          <Input
            label="Capacidade (alunos)"
            type="number"
            min="1"
            value={formData.capacity || ''}
            onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
            required
          />

          <Input
            label="Valor por Aluno (R$)"
            type="number"
            step="0.01"
            min="0"
            value={formData.defaultPricePerStudent || ''}
            onChange={(e) => setFormData({ ...formData, defaultPricePerStudent: parseFloat(e.target.value) })}
            required
          />

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.active !== false}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <span className="font-medium">Turma Ativa</span>
            </label>
          </div>
        </form>
      </Modal>
    </div>
  )
}
