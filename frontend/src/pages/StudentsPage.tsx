import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/appStore'
import { Card, Badge } from '../components/UI'
import { Button, Input, Select, TextArea, Modal } from '../components/Form'
import { Trash2, Edit2, Plus, Eye } from 'lucide-react'
import { Student } from '../types'
import { formatCurrencyBR } from '../utils/formatters'
import { validationService } from '../utils/validationService'

export const StudentsPage = () => {
  const navigate = useNavigate()
  const { students, addStudent, updateStudent, deleteStudent } = useAppStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Student>>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('')

  const formatLastPayment = (value?: string) => {
    if (!value) return '—'
    const normalizedDate = value.length === 7 ? `${value}-01` : value
    const date = new Date(`${normalizedDate}T00:00:00`)
    if (isNaN(date.getTime())) return '—'
    return new Intl.DateTimeFormat('pt-BR', { month: '2-digit', year: 'numeric' }).format(date)
  }

  const filteredStudents = students.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                       s.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchStatus = !filterStatus || s.status === filterStatus
    return matchSearch && matchStatus
  })

  const handleOpenModal = (student?: Student) => {
    if (student) {
      setEditingId(student.id)
      setFormData({
        ...student,
        lastPaymentDate: student.lastPaymentDate ? student.lastPaymentDate.slice(0, 7) : undefined,
      })
    } else {
      setEditingId(null)
      setFormData({
        status: 'ACTIVE',
        billingModel: 'MONTHLY_FIXED',
        defaultHourlyPrice: 100,
      })
    }
    setIsModalOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Use validation service
    const validationResult = validationService.validateStudentData({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
    })

    if (!validationResult.isValid) {
      const errorMessages = validationResult.errors.map((e) => e.message).join('\n')
      alert(`Erros de validação:\n${errorMessages}`)
      return
    }

    const normalizedLastPaymentDate = formData.lastPaymentDate
      ? formData.lastPaymentDate.length === 7
        ? `${formData.lastPaymentDate}-01`
        : formData.lastPaymentDate
      : undefined

    if (formData.status !== 'ACTIVE' && !normalizedLastPaymentDate) {
      alert('Informe o mês do último pagamento para alunos pausados ou encerrados')
      return
    }

    const studentPayload: Partial<Student> = {
      ...formData,
      lastPaymentDate: formData.status === 'ACTIVE' ? undefined : normalizedLastPaymentDate,
    }

    if (editingId) {
      updateStudent(editingId, studentPayload)
    } else {
      const newStudent: Student = {
        id: `student-${Date.now()}`,
        tenantId: 'tenant-1',
        name: studentPayload.name!,
        email: studentPayload.email!,
        phone: studentPayload.phone!,
        status: studentPayload.status as Student['status'],
        lastPaymentDate: studentPayload.lastPaymentDate,
        billingModel: studentPayload.billingModel as Student['billingModel'],
        defaultHourlyPrice: studentPayload.defaultHourlyPrice || 100,
        startDate: new Date().toISOString().split('T')[0],
        notes: studentPayload.notes,
        createdAt: new Date().toISOString(),
        primaryGroupId: studentPayload.primaryGroupId, // Optional
      }
      addStudent(newStudent)
    }

    setIsModalOpen(false)
    setFormData({})
  }

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja deletar este aluno?')) {
      deleteStudent(id)
    }
  }

  const statusBadges = {
    ACTIVE: <Badge variant="success">Ativo</Badge>,
    PAUSED: <Badge variant="warning">Pausado</Badge>,
    CLOSED: <Badge variant="danger">Encerrado</Badge>,
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Alunos</h1>
          <p className="text-gray-600">{filteredStudents.length} aluno(s)</p>
        </div>
        <Button
          variant="primary"
          onClick={() => handleOpenModal()}
          icon={<Plus className="w-5 h-5" />}
        >
          Novo Aluno
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <div className="flex gap-4">
          <Input
            placeholder="Buscar por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Select
            options={[
              { value: '', label: 'Todos os status' },
              { value: 'ACTIVE', label: 'Ativo' },
              { value: 'PAUSED', label: 'Pausado' },
              { value: 'CLOSED', label: 'Encerrado' },
            ]}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          />
        </div>
      </Card>

      {/* Tabela */}
      <Card>
        {filteredStudents.length === 0 ? (
          <p className="text-center py-8 text-gray-500">Nenhum aluno encontrado</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-semibold text-gray-700">Nome</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Email</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Telefone</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Últ. Pgto</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Valor/Hora</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{student.name}</td>
                    <td className="px-4 py-3 text-gray-600">{student.email}</td>
                    <td className="px-4 py-3 text-gray-600">{student.phone}</td>
                    <td className="px-4 py-3">{statusBadges[student.status as keyof typeof statusBadges]}</td>
                    <td className="px-4 py-3 text-gray-600">{formatLastPayment(student.lastPaymentDate)}</td>
                    <td className="px-4 py-3">{formatCurrencyBR(student.defaultHourlyPrice)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/students/${student.id}`)}
                          className="p-2 rounded-lg hover:bg-purple-100 text-purple-600"
                          title="Ver detalhes"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenModal(student)}
                          className="p-2 rounded-lg hover:bg-blue-100 text-blue-600"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(student.id)}
                          className="p-2 rounded-lg hover:bg-red-100 text-red-600"
                          title="Deletar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        title={editingId ? 'Editar Aluno' : 'Novo Aluno'}
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
            label="Nome"
            placeholder="Nome completo"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            placeholder="email@example.com"
            value={formData.email || ''}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <Input
            label="Telefone"
            placeholder="11999999999"
            value={formData.phone || ''}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
          <Select
            label="Status"
            options={[
              { value: 'ACTIVE', label: 'Ativo' },
              { value: 'PAUSED', label: 'Pausado' },
              { value: 'CLOSED', label: 'Encerrado' },
            ]}
            value={formData.status || 'ACTIVE'}
            onChange={(e) => {
              const nextStatus = e.target.value as Student['status']
              setFormData({
                ...formData,
                status: nextStatus,
                lastPaymentDate: nextStatus === 'ACTIVE' ? undefined : formData.lastPaymentDate,
              })
            }}
          />
          {formData.status !== 'ACTIVE' && (
            <Input
              label="Último pagamento (mês)"
              type="month"
              value={formData.lastPaymentDate ? formData.lastPaymentDate.slice(0, 7) : ''}
              onChange={(e) => setFormData({ ...formData, lastPaymentDate: e.target.value })}
              required
            />
          )}
          <Select
            label="Modelo de Cobrança"
            options={[
              { value: 'PER_LESSON', label: 'Por Aula' },
              { value: 'MONTHLY_FIXED', label: 'Mensal Fixo' },
              { value: 'PACKAGE', label: 'Pacote' },
            ]}
            value={formData.billingModel || 'MONTHLY_FIXED'}
            onChange={(e) => setFormData({ ...formData, billingModel: e.target.value as Student['billingModel'] })}
          />
          <Input
            label="Valor/Hora (R$)"
            type="number"
            step="0.01"
            value={formData.defaultHourlyPrice || 100}
            onChange={(e) => setFormData({ ...formData, defaultHourlyPrice: parseFloat(e.target.value) })}
          />
          <TextArea
            label="Notas"
            placeholder="Anotações sobre o aluno..."
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
          />
        </form>
      </Modal>
    </div>
  )
}
