# TeacherFlow - Quick Start 🚀

## 1️⃣ Instalação (2 minutos)

```bash
npm install
```

## 2️⃣ Rodar (1 minuto)

```bash
npm run dev
```

Abre automaticamente em **http://localhost:5173**

## 3️⃣ Login (30 segundos)

Qualquer email/senha funciona. Exemplos:
- demo@teacherflow.com / password
- seu@email.com / 123456
- teste@teste.com / teste

## 4️⃣ Começar a Testar ✅

Clique na sidebar para explorar:
- **📊 Dashboard** - Métricas e resumo
- **👥 Alunos** - CRUD completo
- **📅 Calendário** - Aulas por dia/semana/mês
- **💰 Recebimentos** - Controle de pagamentos
- **📍 Locais** - Salas/endereços
- **👨‍🎓 Turmas** - Grupos de alunos

---

## 🎯 Funcionalidades Prontas para Testar

✅ Criar/editar/deletar alunos (com cascata delete)  
✅ Criar/editar/deletar locais e turmas  
✅ Mudança de status de aulas  
✅ Marcar pagamentos como pago  
✅ Navegar por calendário (dia/semana/mês)  
✅ Filtros em todas as listas  
✅ Todos os dados persistem em memória  
✅ Dark mode completo  
✅ Onboarding de tipos de aula (3 steps)  

---

## 📋 Dados Mock Carregados

**4 Alunos** • **4 Locais** • **3 Turmas** • **5 Aulas** • **5 Pagamentos**

Todos podem ser editados em tempo real. Incluído: 4 tipos de aula com subtypes (Idiomas, Educação Física, Reforço, Música).

---

## ⚠️ Melhorias Implementadas (v2.0)

### Segurança & Dados
- ✅ **Cascata Delete**: Deletar aluno → apaga pagamentos e agendas relacionadas
- ✅ **Integridade Referencial**: Nem deixa deletar local com turmas ativas
- ✅ **Aviso de Perda de Dados**: Ao trocar perfil, avisa se há dados não salvos
- ✅ **Validação de Dropdowns**: Dropdowns vazios mostram mensagem clara

### Documentação
- ✅ **QA & Security Review**: Documento completo em `QA_SECURITY_REVIEW.md`
- ✅ **Propostas Backend**: Estrutura FastAPI + PostgreSQL documentada
- ✅ **Checklist Vulnerabilidades**: 10 itens críticos listados

---

## 📖 Leitura Recomendada

1. **QA_SECURITY_REVIEW.md** - Análise completa de fluxos, segurança e propostas
2. **DEVELOPMENT.md** - Guia técnico de desenvolvimento
3. **README.md** - Visão geral do projeto

---

## 🛑 Próximo Passo

### Imediato
- Ler `QA_SECURITY_REVIEW.md` com toda equipe
- Implementar backend FastAPI + PostgreSQL
- Integrar JWT authentication

### Curto Prazo (2-3 sprints)
1. Autenticação real (password hash + JWT)
2. Database com constraints (PostgreSQL)
3. Validação Pydantic no backend
4. Testes automatizados (Jest + Playwright)

### Antes de Produção
- [ ] Security audit (OWASP)
- [ ] Load testing
- [ ] 80%+ test coverage
- [ ] Monitoring/logging setup
- [ ] HTTPS + CORS configs

---

**Status:** MVP Funcional ✅ | Segurança Básica ✅ | Pronto para Backend 🚀

Para mais detalhes técnicos, veja `QA_SECURITY_REVIEW.md`
