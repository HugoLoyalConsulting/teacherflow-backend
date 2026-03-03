# 🚀 Guia de Desenvolvimento - TeacherFlow Frontend

## Instalação Inicial

### 1. Clonar/Criar Projeto
```bash
cd "c:\Users\Hugo Souza\OneDrive\Documentos\Python Scripts\TeacherFlow App"
```

### 2. Instalar Dependências
```bash
npm install
```

### 3. Iniciar Servidor Dev
```bash
npm run dev
```

Acesse: **http://localhost:5173**

### 4. Credentials Demo
```
Email: demo@teacherflow.com (ou qualquer email)
Senha: password (ou qualquer senha)
```

---

## 📱 Navegação

Sidebar com 6 seções principais:

| Ícone | Página | URL |
|-------|--------|-----|
| 📊 | Dashboard | `/` |
| 👥 | Alunos | `/students` |
| 📅 | Calendário | `/calendar` |
| 💰 | Recebimentos | `/payments` |
| 📍 | Locais | `/locations` |
| 👨‍🎓 | Turmas | `/groups` |

---

## 🎯 O Que Testar Agora

### Dashboard
- ✅ Métricas aparecem corretamente
- ✅ Alertas de pagamentos vencidos funcionam
- ✅ Listagem de aulas da semana

### Alunos
- ✅ CRUD completo (criar, editar, deletar)
- ✅ Buscas por nome/email
- ✅ Filtros por status
- ✅ Dados persistem em memória

### Calendário
- ✅ Semanas navegáveis
- ✅ Aulas aparecem nos dias corretos
- ✅ Modal com detalhes da aula
- ✅ Mudar status da aula

### Recebimentos
- ✅ Filtros por status e mês
- ✅ Marcar pagamento como pago
- ✅ Resumo de valores
- ✅ Visualização de vencidos

### Locais
- ✅ CRUD com cards responsivos
- ✅ Tipos de local coloridos
- ✅ Status ativo/inativo

### Turmas
- ✅ CRUD com informações de capacidade e preço
- ✅ Associação com locais
- ✅ Cálculo de receita potencial

---

## 🛠️ Adicionar Novas Features

### Exemplo: Adicionar Campo em Student

#### 1. Atualize o Type
```typescript
// src/types/index.ts
export interface Student {
  // ... campos existentes
  newField: string  // novo campo
}
```

#### 2. Atualize Mock Data
```typescript
// src/data/mockData.ts
export const mockStudents: Student[] = [
  {
    // ... dados existentes
    newField: 'valor'
  }
]
```

#### 3. Atualize o Store
```typescript
// src/store/appStore.ts - se necessário
```

#### 4. Atualize a Página
```typescript
// src/pages/StudentsPage.tsx
// Adicione input no modal
<Input
  label="Novo Campo"
  value={formData.newField || ''}
  onChange={(e) => setFormData({ ...formData, newField: e.target.value })}
/>
```

---

## 🎨 Componentes Disponíveis

### UI Components
```typescript
import { Card, Badge, Alert } from '@/components/UI'

<Card title="Título">conteúdo</Card>
<Badge variant="success">Ativo</Badge>
<Alert variant="info" title="Info">Mensagem</Alert>
```

### Form Components
```typescript
import { Button, Input, Select, TextArea, Modal } from '@/components/Form'

<Button variant="primary" size="md" icon={<Icon />}>Click</Button>
<Input label="Texto" type="email" />
<Select label="Opções" options={[...]} />
<TextArea label="Descrição" rows={3} />
<Modal isOpen={true} title="Título">conteúdo</Modal>
```

---

## 📊 State Management (Zustand)

### Auth Store
```typescript
import { useAuthStore } from '@/store/authStore'

const { user, isAuthenticated, login, logout } = useAuthStore()
```

### App Store
```typescript
import { useAppStore } from '@/store/appStore'

const { 
  students, addStudent, updateStudent, deleteStudent,
  locations, groups, payments, lessons, schedules 
} = useAppStore()
```

---

## 🔌 Integração com API (Próxima Fase)

Quando tiver o backend pronto, você irá:

1. **Instalar Axios ou TanStack Query**
   ```bash
   npm install @tanstack/react-query axios
   ```

2. **Criar API Client**
   ```typescript
   // src/api/client.ts
   import axios from 'axios'
   
   export const apiClient = axios.create({
     baseURL: import.meta.env.VITE_API_URL
   })
   ```

3. **Substituir Mock Data por API Calls**
   ```typescript
   // Integração com useQuery
   const { data: students } = useQuery({
     queryKey: ['students'],
     queryFn: () => apiClient.get('/students')
   })
   ```

---

## 🚀 Deploy

### Build para Produção
```bash
npm run build
```

Gera arquivos otimizados em `dist/`

### Deploy Options
- **Vercel**: `vercel deploy`
- **Netlify**: Conectar repo do git
- **Railway/Render**: Docker ou npm start

---

## 📝 Checklist para Backend Integration

- [ ] Backend com FastAPI rodando em `http://localhost:8000`
- [ ] Endpoints implementados (auth, students, payments, etc)
- [ ] JWT tokens funcionando
- [ ] CORS configurado
- [ ] Database PostgreSQL pronto
- [ ] Migrations feitas
- [ ] Mock data substituído por queries reais
- [ ] TanStack Query integrado
- [ ] Refresh tokens implementados
- [ ] Rate limiting ativado

---

## 🐛 Debugging

### Console do Navegador
- F12 → Console para logs
- Network tab para requisições (http depois)
- Application → localStorage para verificar auth

### React DevTools
- Extensão Chrome recomendada
- Ver state do Zustand em tempo real

---

## 📚 Úteis

- [React Docs](https://react.dev)
- [TailwindCSS](https://tailwindcss.com)
- [Zustand](https://github.com/pmndrs/zustand)
- [TanStack Query](https://tanstack.com/query)
- [Lucide Icons](https://lucide.dev)

---

**Happy Coding! 🎉**
