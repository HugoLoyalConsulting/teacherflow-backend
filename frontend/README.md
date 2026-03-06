# TeacherFlow Frontend

Aplicacao React + TypeScript do TeacherFlow.

## Escopo

- Interface web para professores
- Integracao com API FastAPI (`/api/v1`)
- Fluxos de autenticacao, dashboard, alunos, turmas, pagamentos e onboarding

## Estrutura

```
frontend/
  src/
    components/
    pages/
    services/
    store/
    utils/
  package.json
  vite.config.ts
```

## Execucao Local

```bash
cd frontend
npm install
npm run dev
```

Build de producao:

```bash
npm run build
npm run preview
```

## Variaveis de Ambiente

Exemplo principal:

```env
VITE_API_URL=https://teacherflow-backend.onrender.com/api/v1
VITE_ENVIRONMENT=production
```

Guia completo: `../docs/VERCEL_ENVIRONMENT_VARIABLES.md`.

## Relacao com o Monorepo

- Documentacao central: `../docs/DOCUMENTATION_INDEX.md`
- Estrutura de pastas: `../docs/overview/FOLDER_STRUCTURE.md`
- Backend correspondente: `../backend/README.md`
└── index.css                 # Tailwind imports
```

---

## 🎯 Funcionalidades Planejadas para Próximas Fases

### Phase 2 (Backend + Integração)
- [ ] API REST (FastAPI)
- [ ] Integração com banco de dados PostgreSQL
- [ ] Autenticação JWT real
- [ ] Persistência de dados

### Phase 3 (Recursos Avançados)
- [ ] FullCalendar com drag-and-drop
- [ ] Webhooks de pagamento
- [ ] Dashboard com gráficos (Chart.js)
- [ ] Relatórios PDF
- [ ] Envio de emails

---

## 📊 Dados Mock

O projeto vem com dados fictícios para testes imediatos:

- **Alunos**: 4 alunos com status variados
- **Locais**: 4 locais (Particular, Escola, Online, Academia)
- **Turmas**: 3 turmas com capacidades diferentes
- **Agendas**: 4 agendas semanais
- **Aulas**: 5 aulas (com status variados)
- **Pagamentos**: 5 pagamentos (Pendente, Pago, Vencido)

Todos os dados são salvos em **Zustand** e podem ser editados em tempo real.

---

## 🎨 Design

- **TailwindCSS**: Utility-first CSS framework
- **Responsive**: Totalmente responsivo (mobile, tablet, desktop)
- **Dark Mode Ready**: estrutura pronta para tema escuro
- **Luci Icons**: Ícones simples e limpos
- **Componentes Reutilizáveis**: Button, Input, Select, Modal, Card, Badge, Alert

---

## 🔌 Integrações Futuras

```typescript
// Exemplo: Como será a integração com API
import axios from 'axios'

const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    Authorization: `Bearer ${token}`
  }
})

// Em vez de mock data, virá da API:
// const students = await apiClient.get('/students')
```

---

## 📝 Notas de Desenvolvimento

- **State Management**: Zustand (simples e poderoso)
- **Requisições**: Ready para TanStack Query
- **Validação**: Pydantic v2 será usado no backend
- **Autenticação**: JWT com refresh tokens

---

## 🤝 Próximos Passos

1. ✅ **Frontend** (CONCLUÍDO) - Estrutura, componentes, pages, state
2. ⏳ **Backend** - FastAPI + SQLAlchemy + PostgreSQL
3. ⏳ **Integração** - Conectar frontend com API
4. ⏳ **QA Completo** - Testes e refinamentos

---

## 📞 Suporte

Para dúvidas ou sugestões, use o sistema de issues.

---

**Desenvolvido com ❤️ para simplificar a gestão de aulas**
