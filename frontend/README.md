# 🎯 TeacherFlow - Sistema de Gestão de Aulas

> **v2.0 - QA & Security Review Complete** ✅

Aplicação React completa para professores gerenciarem aulas, alunos, pagamentos e calendários com segurança e integridade de dados.

---

## 📚 Documentação Completa

Este projeto possui **documentação abrangente** para cada aspecto. Recomendo leitura sequencial:

### ⭐ Docs Essenciais (Obrigatório)

1. **[QUICKSTART.md](QUICKSTART.md)** - 5 min  
   Como instalar, rodar e logar

2. **[QA_SECURITY_REVIEW.md](QA_SECURITY_REVIEW.md)** - 20 min  
   🔍 **IMPORTANTE:** Análise de fluxos, vulnerabilidades, propostas backend

3. **[IMPLEMENTATION_NOTES.md](IMPLEMENTATION_NOTES.md)** - 30 min  
   Backend setup FastAPI, exemplos de código, testes

### 📋 Docs Complementares

4. **[TESTING_CHECKLIST.md](TESTING_CHECKLIST.md)**  
   32 test scenarios para executar manualmente

5. **[CHANGES_v2.md](CHANGES_v2.md)**  
   O que mudou nesta versão + métricas

6. **[DEVELOPMENT.md](DEVELOPMENT.md)**  
   Guia técnico de desenvolvimento

---

## 🚀 Quick Start (90 segundos)

```bash
npm install
npm run dev
# http://localhost:5173
# Email: demo@teacherflow.com | Senha: password (ou qualquer uma)
```

---

## ✨ v2.0 Highlights

### ✅ Cascata Delete Implementado
Deletar aluno → remove pagamentos + agendas + aulas relacionadas

### ✅ Aviso de Perda Dados  
Modal avisa ao trocar entre perfis (Vazio/Demo/Populated)

### ✅ 3 Visões de Calendário
Dia, Semana e Mês - navegação completa

### ✅ Onboarding 3-Steps
Integrado no login - seleção hierárquica de tipos de aula

### ✅ Dark Mode 100%
Funcional em todos componentes

### ✅ Documentação Completa
QA_SECURITY_REVIEW.md + IMPLEMENTATION_NOTES.md com propostas de backend

---

## 📊 Funcionalidades

**Dashboard** • **Alunos** • **Locais** • **Turmas** • **Calendário** (3 views) • **Pagamentos** • **Onboarding** • **Dark Mode**

Veja [QA_SECURITY_REVIEW.md](QA_SECURITY_REVIEW.md) para análise completa de cada feature.

---

## 🔐 Status de Segurança

| Item | Status | Action |
|------|--------|--------|
| Cascata Delete | ✅ Implementado | Pronto |
| Aviso Perda Dados | ✅ Implementado | Pronto |
| JWT Auth | 🔴 Não | Ver IMPLEMENTATION_NOTES.md |
| Password Hash | 🔴 Não | Backend apenas |
| Validation | 🟡 Frontend | Servidor proposto |

**⚠️ MVP/Demo - NÃO use em produção sem backend seguro (QA_SECURITY_REVIEW.md)**

---

## 📁 Estrutura

```
src/
├── pages/           (8 páginas)
├── store/          (Zustand com cascata delete)
├── types/          (TypeScript 100%)
├── components/     (Form, UI, Layout)
└── data/          (Mock fixtures)

Docs/
├── QA_SECURITY_REVIEW.md      ← Leia isto
├── IMPLEMENTATION_NOTES.md    ← Backend guide
├── TESTING_CHECKLIST.md       ← 32 tests
└── ... (5 docs no total)
```

---

## 🎯 Próxima Ação

1. Ler [QA_SECURITY_REVIEW.md](QA_SECURITY_REVIEW.md) com equipe
2. Executar [TESTING_CHECKLIST.md](TESTING_CHECKLIST.md)
3. Começar backend (use IMPLEMENTATION_NOTES.md)

**Data:** 27 de fevereiro, 2026 | **Status:** Ready for QA ✅

## 🚀 Quick Start

### Pré-requisitos
- Node.js 16+ e npm/yarn

### Instalação e Execução

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar servidor de desenvolvimento
npm run dev

# 3. Abrir http://localhost:5173 no navegador
```

### Build para Produção
```bash
npm run build
npm run preview
```

---

## 📋 Funcionalidades Implementadas

### ✅ Autenticação
- Login com demo credentials
- Persistent session (localStorage)
- Logout

### ✅ Dashboard
- Métricas de receita (prevista, realizada)
- Pendências
- Horas agendadas (semana)
- Alertas de pagamentos vencidos
- Resumo de aulas da semana

### ✅ Alunos (CRUD)
- Listar, criar, editar, remover alunos
- Filtros por nome/email e status
- Informações: name, email, phone, status, modelo de cobrança, valor/hora
- Notas

### ✅ Calendário
- Visão semanal com drag-and-drop ready
- Aulas por dia
- Status das aulas (Planejada, Concluída, Cancelada, Não Compareceu)
- Modal com detalhes da aula
- Atualizar status da aula

### ✅ Recebimentos
- Filtros por status (Pendente, Pago, Vencido)
- Filtro por mês
- Resumo de valores
- Marcar como pago
- Alerta visual de vencidos

### ✅ Locais
- CRUD completo
- Tipos: Particular, Escola, Academia, Condomínio, Online
- Endereço e notas
- Status (Ativo/Inativo)
- Grid responsivo

### ✅ Turmas
- CRUD completo
- Associação com local
- Capacidade e preço por aluno
- Status (Ativa/Inativa)

---

## 📁 Estrutura do Projeto

```
src/
├── pages/                    # Páginas principais
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── StudentsPage.tsx
│   ├── CalendarPage.tsx
│   ├── PaymentsPage.tsx
│   ├── LocationsPage.tsx
│   └── GroupsPage.tsx
├── components/
│   ├── Layout/               # Layout principal
│   │   └── Layout.tsx
│   ├── UI/                   # Componentes UI reutilizáveis
│   │   └── index.ts
│   └── Form/                 # Componentes de formulário
│       └── index.tsx
├── store/                    # Zustand stores
│   ├── authStore.ts
│   └── appStore.ts
├── data/                     # Mock data
│   └── mockData.ts
├── types/                    # TypeScript types
│   └── index.ts
├── App.tsx                   # App root com routing
├── main.tsx                  # Entry point
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
