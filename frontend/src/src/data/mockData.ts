import { Student, Location, Group, Payment, LessonInstance, WeeklySchedule, LessonType } from '../types'

export type MockMode = 'empty' | 'demo'

export interface MockDataset {
  students: Student[]
  locations: Location[]
  groups: Group[]
  schedules: WeeklySchedule[]
  lessons: LessonInstance[]
  payments: Payment[]
  lessonTypes: LessonType[]
}

const emptyDataset: MockDataset = {
  students: [],
  locations: [],
  groups: [],
  schedules: [],
  lessons: [],
  payments: [],
  lessonTypes: [],
}

const demoDataset: MockDataset = {
  lessonTypes: [
    {
      id: 'type-1',
      name: 'Idiomas',
      description: 'Aulas de línguas estrangeiras',
      active: true,
      createdAt: '2026-01-01T00:00:00Z',
      subTypes: [
        { id: 'subtype-1-1', name: 'Inglês', description: 'Geral, negócios, preparatório' },
        { id: 'subtype-1-2', name: 'Espanhol', description: 'Básico e avançado' },
        { id: 'subtype-1-3', name: 'Francês', description: 'Conversação e escrita' },
      ],
    },
    {
      id: 'type-2',
      name: 'Educação Física',
      description: 'Aulas de movimento e condicionamento',
      active: true,
      createdAt: '2026-01-01T00:00:00Z',
      subTypes: [
        { id: 'subtype-2-1', name: 'Pilates', description: 'Pilates solo e equipado' },
        { id: 'subtype-2-2', name: 'Yoga', description: 'Hatha, vinyasa, meditação' },
        { id: 'subtype-2-3', name: 'Musculação', description: 'Hipertrofia, funcional' },
      ],
    },
    {
      id: 'type-3',
      name: 'Reforço Escolar',
      description: 'Acompanhamento de disciplinas escolares',
      active: true,
      createdAt: '2026-01-01T00:00:00Z',
      subTypes: [
        { id: 'subtype-3-1', name: 'Matemática', description: 'Fundamental e médio' },
        { id: 'subtype-3-2', name: 'Português', description: 'Leitura, escrita, gramática' },
        { id: 'subtype-3-3', name: 'Ciências', description: 'Biologia, física, química' },
      ],
    },
    {
      id: 'type-4',
      name: 'Música',
      description: 'Aulas de instrumentos e teoria musical',
      active: true,
      createdAt: '2026-01-01T00:00:00Z',
      subTypes: [
        { id: 'subtype-4-1', name: 'Violão', description: 'Clássico e popular' },
        { id: 'subtype-4-2', name: 'Piano', description: 'Clássico, contemporâneo' },
        { id: 'subtype-4-3', name: 'Canto', description: 'Técnica vocal' },
      ],
    },
  ],
  students: [
    // Janeiro 2025 - Início das atividades com primeiros alunos
    { id: 'student-1', tenantId: 'tenant-1', name: 'Alice Nogueira', email: 'alice@ex.com', phone: '11987334411', status: 'ACTIVE', primaryGroupId: 'group-1', billingModel: 'MONTHLY_FIXED', defaultHourlyPrice: 140, startDate: '2025-01-08', notes: 'Primeira aluna. Converteu após aula experimental.', createdAt: '2025-01-08T10:00:00Z' },
    { id: 'student-2', tenantId: 'tenant-1', name: 'Bruno Takahashi', email: 'bruno@ex.com', phone: '11991234567', status: 'ACTIVE', primaryGroupId: 'group-2', billingModel: 'MONTHLY_FIXED', defaultHourlyPrice: 165, startDate: '2025-01-15', notes: 'Indicação da Alice.', createdAt: '2025-01-15T13:30:00Z' },
    { id: 'student-3', tenantId: 'tenant-1', name: 'Carolina Mendes', email: 'carolina@ex.com', phone: '21999881234', status: 'PAUSED', lastPaymentDate: '2025-12-15', primaryGroupId: 'group-3', billingModel: 'MONTHLY_FIXED', defaultHourlyPrice: 130, startDate: '2025-01-20', endDate: '2025-12-31', notes: 'Pausou por mudança de horário escolar em dez/25.', createdAt: '2025-01-20T09:00:00Z' },
    { id: 'student-4', tenantId: 'tenant-1', name: 'Daniela Prado', email: 'daniela@ex.com', phone: '11995550101', status: 'ACTIVE', billingModel: 'MONTHLY_FIXED', defaultHourlyPrice: 155, startDate: '2025-01-22', createdAt: '2025-01-22T11:00:00Z' },
    
    // Fevereiro 2025 - Expansão com indicações
    { id: 'student-5', tenantId: 'tenant-1', name: 'Eduardo Martins', email: 'edu@ex.com', phone: '11988776655', status: 'ACTIVE', billingModel: 'MONTHLY_FIXED', defaultHourlyPrice: 175, startDate: '2025-02-03', notes: 'Indicação corporativa.', createdAt: '2025-02-03T09:00:00Z' },
    { id: 'student-6', tenantId: 'tenant-1', name: 'Fernanda Costa', email: 'ferna@ex.com', phone: '21987654321', status: 'CLOSED', lastPaymentDate: '2025-05-20', billingModel: 'MONTHLY_FIXED', defaultHourlyPrice: 145, startDate: '2025-02-10', endDate: '2025-06-01', notes: 'Cancelou por mudança de cidade em maio/25.', createdAt: '2025-02-10T14:00:00Z' },
    { id: 'student-7', tenantId: 'tenant-1', name: 'Gabriel Silva', email: 'gabi@ex.com', phone: '11992345678', status: 'ACTIVE', billingModel: 'MONTHLY_FIXED', defaultHourlyPrice: 160, startDate: '2025-02-14', createdAt: '2025-02-14T10:30:00Z' },
    { id: 'student-8', tenantId: 'tenant-1', name: 'Helena Rocha', email: 'helena@ex.com', phone: '85999112233', status: 'ACTIVE', primaryGroupId: 'group-8', billingModel: 'MONTHLY_FIXED', defaultHourlyPrice: 135, startDate: '2025-02-20', notes: 'Turma Kids.', createdAt: '2025-02-20T15:00:00Z' },
    
    // Março 2025 - Crescimento sustentado
    { id: 'student-9', tenantId: 'tenant-1', name: 'Igor Lopes', email: 'igor@ex.com', phone: '11993456789', status: 'ACTIVE', billingModel: 'MONTHLY_FIXED', defaultHourlyPrice: 150, startDate: '2025-03-05', createdAt: '2025-03-05T11:00:00Z' },
    { id: 'student-10', tenantId: 'tenant-1', name: 'Julia Ferreira', email: 'julia@ex.com', phone: '21991122334', status: 'CLOSED', lastPaymentDate: '2025-09-10', primaryGroupId: 'group-4', billingModel: 'MONTHLY_FIXED', defaultHourlyPrice: 170, startDate: '2025-03-12', endDate: '2025-10-01', notes: 'Cancelou após concluir objetivo em set/25.', createdAt: '2025-03-12T16:00:00Z' },
    { id: 'student-11', tenantId: 'tenant-1', name: 'Lucas Barbosa', email: 'lucas@ex.com', phone: '11994567890', status: 'ACTIVE', billingModel: 'MONTHLY_FIXED', defaultHourlyPrice: 180, startDate: '2025-03-18', createdAt: '2025-03-18T09:30:00Z' },
    { id: 'student-12', tenantId: 'tenant-1', name: 'Mariana Gomes', email: 'mari@ex.com', phone: '85988776655', status: 'ACTIVE', billingModel: 'MONTHLY_FIXED', defaultHourlyPrice: 155, startDate: '2025-03-25', createdAt: '2025-03-25T13:00:00Z' },
    
    // Abril 2025 - Pico de conversões
    { id: 'student-13', tenantId: 'tenant-1', name: 'Nicolas Oliveira', email: 'nico@ex.com', phone: '11995678901', status: 'ACTIVE', billingModel: 'MONTHLY_FIXED', defaultHourlyPrice: 140, startDate: '2025-04-02', createdAt: '2025-04-02T10:00:00Z' },
    { id: 'student-14', tenantId: 'tenant-1', name: 'Olivia Pereira', email: 'oli@ex.com', phone: '21992233445', status: 'ACTIVE', primaryGroupId: 'group-7', billingModel: 'MONTHLY_FIXED', defaultHourlyPrice: 165, startDate: '2025-04-08', notes: 'Pagamento anualizado em jan/26.', createdAt: '2025-04-08T14:30:00Z' },
    { id: 'student-15', tenantId: 'tenant-1', name: 'Pedro Santos', email: 'pedro@ex.com', phone: '11996789012', status: 'ACTIVE', billingModel: 'MONTHLY_FIXED', defaultHourlyPrice: 175, startDate: '2025-04-15', createdAt: '2025-04-15T11:30:00Z' },
    { id: 'student-16', tenantId: 'tenant-1', name: 'Quiteria Almeida', email: 'quit@ex.com', phone: '85987654321', status: 'ACTIVE', billingModel: 'MONTHLY_FIXED', defaultHourlyPrice: 150, startDate: '2025-04-22', createdAt: '2025-04-22T15:45:00Z' },
    
    // Maio-Junho 2025 - Consolidação
    { id: 'student-17', tenantId: 'tenant-1', name: 'Rafaela Duarte', email: 'rafa@ex.com', phone: '21993344556', status: 'ACTIVE', billingModel: 'MONTHLY_FIXED', defaultHourlyPrice: 160, startDate: '2025-05-10', createdAt: '2025-05-10T12:00:00Z' },
    { id: 'student-18', tenantId: 'tenant-1', name: 'Sergio Neves', email: 'sergio@ex.com', phone: '11997890123', status: 'ACTIVE', primaryGroupId: 'group-2', billingModel: 'MONTHLY_FIXED', defaultHourlyPrice: 185, startDate: '2025-05-20', notes: 'Alta retenção.', createdAt: '2025-05-20T09:00:00Z' },
    { id: 'student-19', tenantId: 'tenant-1', name: 'Tânia Silveira', email: 'tania@ex.com', phone: '11998901234', status: 'ACTIVE', billingModel: 'MONTHLY_FIXED', defaultHourlyPrice: 145, startDate: '2025-06-05', createdAt: '2025-06-05T10:15:00Z' },
    { id: 'student-20', tenantId: 'tenant-1', name: 'Ulisses Freitas', email: 'uli@ex.com', phone: '21994455667', status: 'ACTIVE', billingModel: 'MONTHLY_FIXED', defaultHourlyPrice: 170, startDate: '2025-06-18', createdAt: '2025-06-18T14:00:00Z' },
    
    // Julho-Agosto 2025 - Férias e retomada
    { id: 'student-21', tenantId: 'tenant-1', name: 'Vanessa Lima', email: 'van@ex.com', phone: '11999012345', status: 'CLOSED', lastPaymentDate: '2025-11-20', billingModel: 'MONTHLY_FIXED', defaultHourlyPrice: 155, startDate: '2025-07-08', endDate: '2025-12-01', notes: 'Cancelou por questões financeiras em nov/25.', createdAt: '2025-07-08T11:00:00Z' },
    { id: 'student-22', tenantId: 'tenant-1', name: 'Wagner Souza', email: 'wagner@ex.com', phone: '85990123456', status: 'ACTIVE', billingModel: 'MONTHLY_FIXED', defaultHourlyPrice: 165, startDate: '2025-08-01', createdAt: '2025-08-01T10:30:00Z' },
    { id: 'student-23', tenantId: 'tenant-1', name: 'Xavier Costa', email: 'xavier@ex.com', phone: '11991234567', status: 'ACTIVE', primaryGroupId: 'group-1', billingModel: 'MONTHLY_FIXED', defaultHourlyPrice: 140, startDate: '2025-08-12', notes: 'Turma Kids.', createdAt: '2025-08-12T15:00:00Z' },
    
    // Setembro-Outubro 2025 - Segundo semestre forte
    { id: 'student-24', tenantId: 'tenant-1', name: 'Yasmin Ribeiro', email: 'yas@ex.com', phone: '21995566778', status: 'ACTIVE', billingModel: 'MONTHLY_FIXED', defaultHourlyPrice: 150, startDate: '2025-09-05', createdAt: '2025-09-05T09:00:00Z' },
    { id: 'student-25', tenantId: 'tenant-1', name: 'Zeca Mendes', email: 'zeca@ex.com', phone: '11992345678', status: 'ACTIVE', billingModel: 'MONTHLY_FIXED', defaultHourlyPrice: 175, startDate: '2025-09-15', createdAt: '2025-09-15T13:30:00Z' },
    { id: 'student-26', tenantId: 'tenant-1', name: 'Amanda Lopes', email: 'amanda@ex.com', phone: '85993456789', status: 'ACTIVE', billingModel: 'MONTHLY_FIXED', defaultHourlyPrice: 160, startDate: '2025-10-01', createdAt: '2025-10-01T10:00:00Z' },
    { id: 'student-27', tenantId: 'tenant-1', name: 'Bernardo Alves', email: 'beto@ex.com', phone: '11994567890', status: 'ACTIVE', billingModel: 'MONTHLY_FIXED', defaultHourlyPrice: 145, startDate: '2025-10-18', createdAt: '2025-10-18T14:45:00Z' },
    
    // Novembro-Dezembro 2025 - Fechamento do ano
    { id: 'student-28', tenantId: 'tenant-1', name: 'Camila Dias', email: 'cami@ex.com', phone: '21996677889', status: 'ACTIVE', billingModel: 'MONTHLY_FIXED', defaultHourlyPrice: 155, startDate: '2025-11-05', createdAt: '2025-11-05T11:30:00Z' },
    { id: 'student-29', tenantId: 'tenant-1', name: 'Diego Martins', email: 'diego@ex.com', phone: '11995678901', status: 'ACTIVE', primaryGroupId: 'group-8', billingModel: 'MONTHLY_FIXED', defaultHourlyPrice: 135, startDate: '2025-11-20', notes: 'Reforço escolar.', createdAt: '2025-11-20T16:00:00Z' },
    { id: 'student-30', tenantId: 'tenant-1', name: 'Elaine Santos', email: 'elaine@ex.com', phone: '85994567890', status: 'ACTIVE', billingModel: 'MONTHLY_FIXED', defaultHourlyPrice: 170, startDate: '2025-12-02', createdAt: '2025-12-02T09:15:00Z' },
    
    // Janeiro 2026 - Continuidade
    { id: 'student-31', tenantId: 'tenant-1', name: 'Fabio Rocha', email: 'fabio@ex.com', phone: '11996789012', status: 'ACTIVE', billingModel: 'MONTHLY_FIXED', defaultHourlyPrice: 180, startDate: '2026-01-10', notes: 'Indicação de aluno antigo.', createdAt: '2026-01-10T10:30:00Z' },
    { id: 'student-32', tenantId: 'tenant-1', name: 'Giovana Pires', email: 'gio@ex.com', phone: '21997890123', status: 'ACTIVE', billingModel: 'MONTHLY_FIXED', defaultHourlyPrice: 165, startDate: '2026-01-22', createdAt: '2026-01-22T14:00:00Z' },
  ],
  locations: [
    { id: 'location-1', tenantId: 'tenant-1', name: 'Escola Horizonte Azul', type: 'SCHOOL', unitName: 'Unidade Vila Mariana', address: 'Rua Domingos de Morais, 1024 - São Paulo, SP', notes: 'Acesso pela portaria B, sala 14.', active: true },
    { id: 'location-2', tenantId: 'tenant-1', name: 'Academia Corpo & Mente', type: 'ACADEMY', unitName: 'Sala Multiuso 2', address: 'Av. Jabaquara, 2150 - São Paulo, SP', notes: 'Disponível seg/qua/sex das 18h às 21h.', active: true },
    { id: 'location-3', tenantId: 'tenant-1', name: 'Atendimento Online', type: 'ONLINE', notes: 'Aulas por Google Meet com link fixo por aluno.', active: true },
    { id: 'location-4', tenantId: 'tenant-1', name: 'Condomínio Parque das Árvores', type: 'CONDOMINIUM', unitName: 'Espaço Kids', address: 'Rua das Acácias, 88 - São Paulo, SP', notes: 'Necessário cadastro prévio na portaria.', active: true },
    { id: 'location-5', tenantId: 'tenant-1', name: 'Studio Particular', type: 'PARTICULAR', address: 'Rua das Flores, 456 - São Paulo, SP', notes: 'Espaço privado para aulas individuais.', active: true },
  ],
  groups: [
    { id: 'group-1', tenantId: 'tenant-1', name: 'Turma Kids - Leitura', locationId: 'location-1', capacity: 6, defaultPricePerStudent: 190, active: true },
    { id: 'group-2', tenantId: 'tenant-1', name: 'Turma Teens - Reforço Matemática', locationId: 'location-2', capacity: 8, defaultPricePerStudent: 220, active: true },
    { id: 'group-3', tenantId: 'tenant-1', name: 'Inglês Conversação (Noite)', locationId: 'location-3', capacity: 10, defaultPricePerStudent: 150, active: true },
    { id: 'group-4', tenantId: 'tenant-1', name: 'Yoga Matutina', locationId: 'location-2', capacity: 12, defaultPricePerStudent: 180, active: false },
    { id: 'group-5', tenantId: 'tenant-1', name: 'Pilates (Tarde)', locationId: 'location-2', capacity: 8, defaultPricePerStudent: 200, active: true },
    { id: 'group-6', tenantId: 'tenant-1', name: 'Música - Violão Grupo', locationId: 'location-1', capacity: 5, defaultPricePerStudent: 210, active: false },
    { id: 'group-7', tenantId: 'tenant-1', name: 'Espanhol Avançado', locationId: 'location-5', capacity: 6, defaultPricePerStudent: 170, active: true },
    { id: 'group-8', tenantId: 'tenant-1', name: 'Reforço Português', locationId: 'location-1', capacity: 8, defaultPricePerStudent: 190, active: true },
  ],
  schedules: [
    // Student schedules
    { id: 'schedule-1', tenantId: 'tenant-1', studentId: 'student-1', weekday: 1, startTime: '14:00', durationMinutes: 60, locationId: 'location-1', active: true },
    { id: 'schedule-2', tenantId: 'tenant-1', studentId: 'student-2', weekday: 3, startTime: '19:00', durationMinutes: 90, locationId: 'location-3', active: true },
    { id: 'schedule-3', tenantId: 'tenant-1', studentId: 'student-4', weekday: 5, startTime: '16:00', durationMinutes: 60, locationId: 'location-4', active: true },
    { id: 'schedule-5', tenantId: 'tenant-1', studentId: 'student-5', weekday: 2, startTime: '10:00', durationMinutes: 90, locationId: 'location-5', active: true },
    { id: 'schedule-6', tenantId: 'tenant-1', studentId: 'student-6', weekday: 4, startTime: '18:00', durationMinutes: 60, locationId: 'location-3', active: true },
    { id: 'schedule-7', tenantId: 'tenant-1', studentId: 'student-7', weekday: 1, startTime: '15:30', durationMinutes: 60, locationId: 'location-2', active: true },
    { id: 'schedule-8', tenantId: 'tenant-1', studentId: 'student-8', weekday: 3, startTime: '10:00', durationMinutes: 60, locationId: 'location-1', active: true },
    { id: 'schedule-9', tenantId: 'tenant-1', studentId: 'student-9', weekday: 2, startTime: '19:30', durationMinutes: 90, locationId: 'location-3', active: true },
    { id: 'schedule-10', tenantId: 'tenant-1', studentId: 'student-10', weekday: 5, startTime: '14:00', durationMinutes: 60, locationId: 'location-5', active: true },
    { id: 'schedule-11', tenantId: 'tenant-1', studentId: 'student-11', weekday: 0, startTime: '11:00', durationMinutes: 90, locationId: 'location-3', active: true },
    { id: 'schedule-12', tenantId: 'tenant-1', studentId: 'student-12', weekday: 4, startTime: '15:00', durationMinutes: 60, locationId: 'location-2', active: true },
    { id: 'schedule-13', tenantId: 'tenant-1', studentId: 'student-13', weekday: 1, startTime: '10:30', durationMinutes: 60, locationId: 'location-5', active: true },
    { id: 'schedule-14', tenantId: 'tenant-1', studentId: 'student-14', weekday: 3, startTime: '17:00', durationMinutes: 60, locationId: 'location-4', active: true },
    { id: 'schedule-15', tenantId: 'tenant-1', studentId: 'student-15', weekday: 2, startTime: '16:00', durationMinutes: 90, locationId: 'location-3', active: true },
    { id: 'schedule-16', tenantId: 'tenant-1', studentId: 'student-16', weekday: 5, startTime: '17:30', durationMinutes: 60, locationId: 'location-2', active: true },
    { id: 'schedule-17', tenantId: 'tenant-1', studentId: 'student-17', weekday: 0, startTime: '14:00', durationMinutes: 90, locationId: 'location-3', active: true },
    { id: 'schedule-18', tenantId: 'tenant-1', studentId: 'student-18', weekday: 4, startTime: '19:00', durationMinutes: 60, locationId: 'location-1', active: true },
    // Group schedules
    { id: 'schedule-g1', tenantId: 'tenant-1', groupId: 'group-1', weekday: 2, startTime: '10:30', durationMinutes: 60, locationId: 'location-1', active: true },
    { id: 'schedule-g2', tenantId: 'tenant-1', groupId: 'group-2', weekday: 5, startTime: '14:00', durationMinutes: 90, locationId: 'location-2', active: true },
    { id: 'schedule-g3', tenantId: 'tenant-1', groupId: 'group-3', weekday: 3, startTime: '19:00', durationMinutes: 90, locationId: 'location-3', active: true },
    { id: 'schedule-g4', tenantId: 'tenant-1', groupId: 'group-4', weekday: 0, startTime: '08:00', durationMinutes: 60, locationId: 'location-2', active: true },
    { id: 'schedule-g5', tenantId: 'tenant-1', groupId: 'group-5', weekday: 2, startTime: '14:00', durationMinutes: 60, locationId: 'location-2', active: true },
    { id: 'schedule-g6', tenantId: 'tenant-1', groupId: 'group-6', weekday: 1, startTime: '16:00', durationMinutes: 60, locationId: 'location-1', active: true },
    { id: 'schedule-g7', tenantId: 'tenant-1', groupId: 'group-7', weekday: 4, startTime: '18:00', durationMinutes: 90, locationId: 'location-5', active: true },
    { id: 'schedule-g8', tenantId: 'tenant-1', groupId: 'group-8', weekday: 3, startTime: '15:30', durationMinutes: 60, locationId: 'location-1', active: true },
  ],
  lessons: [
    // Janeiro - todas completadas
    { id: 'lesson-1', tenantId: 'tenant-1', scheduleId: 'schedule-1', date: '2026-01-05', status: 'COMPLETED', priceSnapshot: 140, createdAt: '2026-01-05T14:00:00Z' },
    { id: 'lesson-2', tenantId: 'tenant-1', scheduleId: 'schedule-2', date: '2026-01-07', status: 'COMPLETED', priceSnapshot: 247.5, createdAt: '2026-01-07T19:00:00Z' },
    { id: 'lesson-3', tenantId: 'tenant-1', scheduleId: 'schedule-g1', date: '2026-01-13', status: 'COMPLETED', priceSnapshot: 1140, createdAt: '2026-01-13T10:30:00Z' },
    { id: 'lesson-4', tenantId: 'tenant-1', scheduleId: 'schedule-4', date: '2026-01-16', status: 'COMPLETED', priceSnapshot: 155, createdAt: '2026-01-16T16:00:00Z' },
    { id: 'lesson-5', tenantId: 'tenant-1', scheduleId: 'schedule-5', date: '2026-01-19', status: 'COMPLETED', priceSnapshot: 262.5, createdAt: '2026-01-19T10:00:00Z' },
    { id: 'lesson-6', tenantId: 'tenant-1', scheduleId: 'schedule-7', date: '2026-01-25', status: 'COMPLETED', priceSnapshot: 160, createdAt: '2026-01-25T15:30:00Z' },
    { id: 'lesson-7', tenantId: 'tenant-1', scheduleId: 'schedule-g2', date: '2026-01-30', status: 'COMPLETED', priceSnapshot: 1760, createdAt: '2026-01-30T14:00:00Z' },
    
    // Fevereiro - mix de completadas e planejadas
    { id: 'lesson-8', tenantId: 'tenant-1', scheduleId: 'schedule-6', date: '2026-02-03', status: 'COMPLETED', priceSnapshot: 145, createdAt: '2026-02-03T18:00:00Z' },
    { id: 'lesson-9', tenantId: 'tenant-1', scheduleId: 'schedule-8', date: '2026-02-10', status: 'COMPLETED', priceSnapshot: 135, createdAt: '2026-02-10T10:00:00Z' },
    { id: 'lesson-10', tenantId: 'tenant-1', scheduleId: 'schedule-1', date: '2026-02-12', status: 'COMPLETED', priceSnapshot: 140, createdAt: '2026-02-12T14:00:00Z' },
    { id: 'lesson-11', tenantId: 'tenant-1', scheduleId: 'schedule-9', date: '2026-02-15', status: 'NO_SHOW', priceSnapshot: 150, createdAt: '2026-02-15T11:00:00Z' },
    { id: 'lesson-12', tenantId: 'tenant-1', scheduleId: 'schedule-g3', date: '2026-02-19', status: 'COMPLETED', priceSnapshot: 1500, createdAt: '2026-02-19T19:00:00Z' },
    { id: 'lesson-13', tenantId: 'tenant-1', scheduleId: 'schedule-4', date: '2026-02-20', status: 'COMPLETED', priceSnapshot: 155, createdAt: '2026-02-20T16:00:00Z' },
    { id: 'lesson-14', tenantId: 'tenant-1', scheduleId: 'schedule-7', date: '2026-02-23', status: 'COMPLETED', priceSnapshot: 160, createdAt: '2026-02-23T15:30:00Z' },
    { id: 'lesson-15', tenantId: 'tenant-1', scheduleId: 'schedule-g1', date: '2026-02-24', status: 'COMPLETED', priceSnapshot: 1140, createdAt: '2026-02-24T10:30:00Z' },
    { id: 'lesson-16', tenantId: 'tenant-1', scheduleId: 'schedule-6', date: '2026-02-25', status: 'COMPLETED', priceSnapshot: 145, createdAt: '2026-02-25T18:00:00Z' },
    { id: 'lesson-17', tenantId: 'tenant-1', scheduleId: 'schedule-2', date: '2026-02-25', status: 'COMPLETED', priceSnapshot: 247.5, createdAt: '2026-02-25T19:00:00Z' },
    
    // Final de fevereiro e março - planejadas (hoje é 27/02)
    { id: 'lesson-18', tenantId: 'tenant-1', scheduleId: 'schedule-g2', date: '2026-02-27', status: 'PLANNED', priceSnapshot: 1760, createdAt: '2026-02-27T14:00:00Z' },
    { id: 'lesson-19', tenantId: 'tenant-1', scheduleId: 'schedule-10', date: '2026-02-28', status: 'PLANNED', priceSnapshot: 170, createdAt: '2026-02-28T09:30:00Z' },
    { id: 'lesson-20', tenantId: 'tenant-1', scheduleId: 'schedule-g3', date: '2026-03-04', status: 'PLANNED', priceSnapshot: 1500, createdAt: '2026-03-04T19:00:00Z' },
  ],
  payments: [
    // Pagamentos base - serão expandidos automaticamente pelo sistema de recorrência
    // Ajustados para receita mensal realista: 5-7k com ~28 alunos ativos (média 200-250/aluno)
    // Janeiro 2025 - primeiros alunos
    { id: 'payment-1', tenantId: 'tenant-1', studentId: 'student-1', dueDate: '2025-01-10', amount: 200, status: 'PAID', paidDate: '2025-01-10T10:00:00Z', recurrence: 'MONTHLY', paymentFrequency: 'MONTHLY', createdAt: '2025-01-08T10:00:00Z' },
    { id: 'payment-2', tenantId: 'tenant-1', studentId: 'student-2', dueDate: '2025-01-20', amount: 235, status: 'PAID', paidDate: '2025-01-20T11:00:00Z', recurrence: 'MONTHLY', paymentFrequency: 'MONTHLY', createdAt: '2025-01-15T13:30:00Z' },
    { id: 'payment-3', tenantId: 'tenant-1', studentId: 'student-3', dueDate: '2025-01-25', amount: 190, status: 'PAID', paidDate: '2025-01-25T09:00:00Z', recurrence: 'MONTHLY', paymentFrequency: 'MONTHLY', createdAt: '2025-01-20T09:00:00Z' },
    { id: 'payment-4', tenantId: 'tenant-1', studentId: 'student-4', dueDate: '2025-01-28', amount: 220, status: 'PAID', paidDate: '2025-01-28T14:00:00Z', recurrence: 'MONTHLY', paymentFrequency: 'MONTHLY', createdAt: '2025-01-22T11:00:00Z' },
    
    // Fevereiro 2025
    { id: 'payment-5', tenantId: 'tenant-1', studentId: 'student-5', dueDate: '2025-02-08', amount: 240, status: 'PAID', paidDate: '2025-02-08T10:00:00Z', recurrence: 'MONTHLY', paymentFrequency: 'MONTHLY', createdAt: '2025-02-03T09:00:00Z' },
    { id: 'payment-6', tenantId: 'tenant-1', studentId: 'student-6', dueDate: '2025-02-15', amount: 210, status: 'PAID', paidDate: '2025-02-15T11:00:00Z', recurrence: 'MONTHLY', paymentFrequency: 'MONTHLY', createdAt: '2025-02-10T14:00:00Z' },
    { id: 'payment-7', tenantId: 'tenant-1', studentId: 'student-7', dueDate: '2025-02-20', amount: 225, status: 'PAID', paidDate: '2025-02-20T09:30:00Z', recurrence: 'MONTHLY', paymentFrequency: 'MONTHLY', createdAt: '2025-02-14T10:30:00Z' },
    { id: 'payment-8', tenantId: 'tenant-1', studentId: 'student-8', dueDate: '2025-02-25', amount: 195, status: 'PAID', paidDate: '2025-02-25T10:00:00Z', recurrence: 'MONTHLY', paymentFrequency: 'MONTHLY', createdAt: '2025-02-20T15:00:00Z' },
    
    // Março 2025
    { id: 'payment-9', tenantId: 'tenant-1', studentId: 'student-9', dueDate: '2025-03-10', amount: 215, status: 'PAID', paidDate: '2025-03-10T11:00:00Z', recurrence: 'MONTHLY', paymentFrequency: 'MONTHLY', createdAt: '2025-03-05T11:00:00Z' },
    { id: 'payment-10', tenantId: 'tenant-1', studentId: 'student-10', dueDate: '2025-03-18', amount: 245, status: 'PAID', paidDate: '2025-03-18T10:00:00Z', recurrence: 'MONTHLY', paymentFrequency: 'MONTHLY', createdAt: '2025-03-12T16:00:00Z' },
    { id: 'payment-11', tenantId: 'tenant-1', studentId: 'student-11', dueDate: '2025-03-23', amount: 250, status: 'PAID', paidDate: '2025-03-23T09:00:00Z', recurrence: 'MONTHLY', paymentFrequency: 'MONTHLY', createdAt: '2025-03-18T09:30:00Z' },
    { id: 'payment-12', tenantId: 'tenant-1', studentId: 'student-12', dueDate: '2025-03-30', amount: 220, status: 'PAID', paidDate: '2025-03-30T14:00:00Z', recurrence: 'MONTHLY', paymentFrequency: 'MONTHLY', createdAt: '2025-03-25T13:00:00Z' },
    
    // Abril 2025
    { id: 'payment-13', tenantId: 'tenant-1', studentId: 'student-13', dueDate: '2025-04-07', amount: 200, status: 'PAID', paidDate: '2025-04-07T10:00:00Z', recurrence: 'MONTHLY', paymentFrequency: 'MONTHLY', createdAt: '2025-04-02T10:00:00Z' },
    { id: 'payment-14', tenantId: 'tenant-1', studentId: 'student-14', dueDate: '2025-04-13', amount: 235, status: 'PAID', paidDate: '2025-04-13T11:00:00Z', recurrence: 'MONTHLY', paymentFrequency: 'MONTHLY', createdAt: '2025-04-08T14:30:00Z' },
    { id: 'payment-15', tenantId: 'tenant-1', studentId: 'student-15', dueDate: '2025-04-20', amount: 240, status: 'PAID', paidDate: '2025-04-20T09:00:00Z', recurrence: 'MONTHLY', paymentFrequency: 'MONTHLY', createdAt: '2025-04-15T11:30:00Z' },
    { id: 'payment-16', tenantId: 'tenant-1', studentId: 'student-16', dueDate: '2025-04-27', amount: 215, status: 'PAID', paidDate: '2025-04-27T10:00:00Z', recurrence: 'MONTHLY', paymentFrequency: 'MONTHLY', createdAt: '2025-04-22T15:45:00Z' },
    
    // Maio 2025
    { id: 'payment-17', tenantId: 'tenant-1', studentId: 'student-17', dueDate: '2025-05-15', amount: 225, status: 'PAID', paidDate: '2025-05-15T11:00:00Z', recurrence: 'MONTHLY', paymentFrequency: 'MONTHLY', createdAt: '2025-05-10T12:00:00Z' },
    { id: 'payment-18', tenantId: 'tenant-1', studentId: 'student-18', dueDate: '2025-05-25', amount: 250, status: 'PAID', paidDate: '2025-05-25T10:00:00Z', recurrence: 'MONTHLY', paymentFrequency: 'MONTHLY', createdAt: '2025-05-20T09:00:00Z' },
    
    // Junho 2025
    { id: 'payment-19', tenantId: 'tenant-1', studentId: 'student-19', dueDate: '2025-06-10', amount: 210, status: 'PAID', paidDate: '2025-06-10T09:30:00Z', recurrence: 'MONTHLY', paymentFrequency: 'MONTHLY', createdAt: '2025-06-05T10:15:00Z' },
    { id: 'payment-20', tenantId: 'tenant-1', studentId: 'student-20', dueDate: '2025-06-23', amount: 240, status: 'PAID', paidDate: '2025-06-23T14:00:00Z', recurrence: 'MONTHLY', paymentFrequency: 'MONTHLY', createdAt: '2025-06-18T14:00:00Z' },
    
    // Julho 2025
    { id: 'payment-21', tenantId: 'tenant-1', studentId: 'student-21', dueDate: '2025-07-13', amount: 220, status: 'PAID', paidDate: '2025-07-13T10:00:00Z', recurrence: 'MONTHLY', paymentFrequency: 'MONTHLY', createdAt: '2025-07-08T11:00:00Z' },
    
    // Agosto 2025
    { id: 'payment-22', tenantId: 'tenant-1', studentId: 'student-22', dueDate: '2025-08-06', amount: 235, status: 'PAID', paidDate: '2025-08-06T11:00:00Z', recurrence: 'MONTHLY', paymentFrequency: 'MONTHLY', createdAt: '2025-08-01T10:30:00Z' },
    { id: 'payment-23', tenantId: 'tenant-1', studentId: 'student-23', dueDate: '2025-08-17', amount: 200, status: 'PAID', paidDate: '2025-08-17T10:00:00Z', recurrence: 'MONTHLY', paymentFrequency: 'MONTHLY', createdAt: '2025-08-12T15:00:00Z' },
    
    // Setembro 2025
    { id: 'payment-24', tenantId: 'tenant-1', studentId: 'student-24', dueDate: '2025-09-10', amount: 215, status: 'PAID', paidDate: '2025-09-10T09:00:00Z', recurrence: 'MONTHLY', paymentFrequency: 'MONTHLY', createdAt: '2025-09-05T09:00:00Z' },
    { id: 'payment-25', tenantId: 'tenant-1', studentId: 'student-25', dueDate: '2025-09-20', amount: 240, status: 'PAID', paidDate: '2025-09-20T11:00:00Z', recurrence: 'MONTHLY', paymentFrequency: 'MONTHLY', createdAt: '2025-09-15T13:30:00Z' },
    
    // Outubro 2025
    { id: 'payment-26', tenantId: 'tenant-1', studentId: 'student-26', dueDate: '2025-10-06', amount: 225, status: 'PAID', paidDate: '2025-10-06T10:00:00Z', recurrence: 'MONTHLY', paymentFrequency: 'MONTHLY', createdAt: '2025-10-01T10:00:00Z' },
    { id: 'payment-27', tenantId: 'tenant-1', studentId: 'student-27', dueDate: '2025-10-23', amount: 210, status: 'PAID', paidDate: '2025-10-23T14:00:00Z', recurrence: 'MONTHLY', paymentFrequency: 'MONTHLY', createdAt: '2025-10-18T14:45:00Z' },
    
    // Novembro 2025
    { id: 'payment-28', tenantId: 'tenant-1', studentId: 'student-28', dueDate: '2025-11-10', amount: 220, status: 'PAID', paidDate: '2025-11-10T10:00:00Z', recurrence: 'MONTHLY', paymentFrequency: 'MONTHLY', createdAt: '2025-11-05T11:30:00Z' },
    { id: 'payment-29', tenantId: 'tenant-1', studentId: 'student-29', dueDate: '2025-11-25', amount: 195, status: 'PAID', paidDate: '2025-11-25T11:00:00Z', recurrence: 'MONTHLY', paymentFrequency: 'MONTHLY', createdAt: '2025-11-20T16:00:00Z' },
    
    // Dezembro 2025
    { id: 'payment-30', tenantId: 'tenant-1', studentId: 'student-30', dueDate: '2025-12-07', amount: 245, status: 'PAID', paidDate: '2025-12-07T09:00:00Z', recurrence: 'MONTHLY', paymentFrequency: 'MONTHLY', createdAt: '2025-12-02T09:15:00Z' },
    
    // Janeiro 2026
    { id: 'payment-31', tenantId: 'tenant-1', studentId: 'student-31', dueDate: '2026-01-15', amount: 250, status: 'PAID', paidDate: '2026-01-15T10:00:00Z', recurrence: 'MONTHLY', paymentFrequency: 'MONTHLY', createdAt: '2026-01-10T10:30:00Z' },
    { id: 'payment-32', tenantId: 'tenant-1', studentId: 'student-32', dueDate: '2026-01-27', amount: 235, status: 'PAID', paidDate: '2026-01-27T11:00:00Z', recurrence: 'MONTHLY', paymentFrequency: 'MONTHLY', createdAt: '2026-01-22T14:00:00Z' },
  ],
}

export const mockDatasets: Record<MockMode, MockDataset> = {
  empty: emptyDataset,
  demo: demoDataset,
}

const ALLOWED_PRICE_STEPS = [100, 125, 150, 175, 200]

const normalizePriceStep = (value: number): number => {
  const bounded = Math.min(200, Math.max(100, value))
  return ALLOWED_PRICE_STEPS.reduce((closest, current) => {
    return Math.abs(current - bounded) < Math.abs(closest - bounded) ? current : closest
  }, ALLOWED_PRICE_STEPS[0])
}

const normalizeDemoDataset = (dataset: MockDataset): MockDataset => {
  const normalizedStudents = dataset.students.map((student) => ({
    ...student,
    defaultHourlyPrice: normalizePriceStep(student.defaultHourlyPrice),
  }))

  const studentsById = new Map(normalizedStudents.map((student) => [student.id, student]))

  return {
    ...dataset,
    students: normalizedStudents,
    groups: dataset.groups.map((group) => ({
      ...group,
      defaultPricePerStudent: normalizePriceStep(group.defaultPricePerStudent),
    })),
    lessons: dataset.lessons.map((lesson) => ({
      ...lesson,
      priceSnapshot: normalizePriceStep(lesson.priceSnapshot),
    })),
    payments: dataset.payments.map((payment) => {
      const student = studentsById.get(payment.studentId)
      const hourlyRate = student ? normalizePriceStep(student.defaultHourlyPrice) : 150
      const monthlyAmount = normalizePriceStep(hourlyRate)

      return {
        ...payment,
        amount: monthlyAmount,
      }
    }),
  }
}

const cloneDataset = (dataset: MockDataset): MockDataset => ({
  students: dataset.students.map((item) => ({ ...item })),
  locations: dataset.locations.map((item) => ({ ...item })),
  groups: dataset.groups.map((item) => ({ ...item })),
  schedules: dataset.schedules.map((item) => ({ ...item })),
  lessons: dataset.lessons.map((item) => ({ ...item })),
  payments: dataset.payments.map((item) => ({ ...item })),
  lessonTypes: dataset.lessonTypes.map((item) => ({ ...item, subTypes: [...item.subTypes] })),
})

export const getMockDataset = (mode: MockMode): MockDataset => {
  const cloned = cloneDataset(mockDatasets[mode])

  if (mode === 'demo') {
    return normalizeDemoDataset(cloned)
  }

  return cloned
}

export const mockStudents = emptyDataset.students
export const mockLocations = emptyDataset.locations
export const mockGroups = emptyDataset.groups
export const mockSchedules = emptyDataset.schedules
export const mockLessons = emptyDataset.lessons
export const mockPayments = emptyDataset.payments
export const mockLessonTypes = emptyDataset.lessonTypes
