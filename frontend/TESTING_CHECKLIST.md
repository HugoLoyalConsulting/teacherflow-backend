# ✅ TeacherFlow - Testing Checklist v2.0

**Data:** 27 de fevereiro, 2026  
**Executado por:** _________________  
**Data de Execução:** _________________  

---

## 🚀 Setup Inicial

### Antes de Iniciar Testes

- [ ] npm install completado
- [ ] npm run dev rodando sem erros
- [ ] Acesso http://localhost:5173 funcionando
- [ ] DevTools aberto (F12) - Console limpo
- [ ] Dark mode funcionando (botão sol/lua)

---

## 🔐 Seção 1: Autenticação & Onboarding

### 1.1 Login Básico

```gherkin
Cenário: Login com credenciais demo
  Dado: Página de login aberta
  Quando: Enter "demo@teacherflow.com"
  E: Enter "password"
  E: Click "Entrar"
  Então: Deve redirecionar para /onboarding
  E: User não deve estar completo (onboardingComplete = false)
  
Status: [ ] ✅ [ ] ⚠️ [ ] ❌
Notas: ___________
```

### 1.2 Onboarding 3-Step Flow

```gherkin
Cenário: Completar onboarding com sucesso
  Step 1 - Welcome:
    - [ ] Mostra "Bem-vindo ao TeacherFlow!"
    - [ ] Mostra 4 callouts
    - [ ] Botão "Começar" funciona
  
  Step 2 - Select Types:
    - [ ] Mostra 4 tipos de aula (Idiomas, Ed. Física, Reforço, Música)
    - [ ] Cada tipo é expandível
    - [ ] Checkbox seleciona tipo
    - [ ] Badge mostra count de subtypes
    - [ ] Botão "Próximo" desabilitado se nada selecionado
    - [ ] Selecionar "Idiomas" → mostra Inglês, Espanhol, Francês
    - [ ] Clicar em subtype → checkbox marca
    - [ ] "Próximo" fica habilitado após selecionar tipo
  
  Step 3 - Name:
    - [ ] Mostra summary de tipos selecionados
    - [ ] Input "Nome Completo" funciona
    - [ ] Botão "Concluir Onboarding" desabilitado se sem nome
    - [ ] Enter nome e click concluir
  
  Final:
    - [ ] Redireciona para/` (Dashboard)
    - [ ] User.onboardingComplete = true em localStorage
    - [ ] Logout e login → não pede onboarding novamente

Status: [ ] ✅ [ ] ⚠️ [ ] ❌
Notas: ___________
```

### 1.3 Logout

```gherkin
Cenário: Logout
  Dado: User autenticado
  Quando: Click menu no sidebar + "Sair"
  Então: Redireciona para /login
  E: localStorage limpo (user, access_token, etc)
  E: Dashboard não deve ser acessível (redirect /login)
  
Status: [ ] ✅ [ ] ⚠️ [ ] ❌
Notas: ___________
```

---

## 📊 Seção 2: Dashboard & Mock Modes

### 2.1 Métricas Básicas

```gherkin
Cenário: Dashboard mostra métricas corretas
  Dado: Perfil "Demo" carregado
  Então: Deve mostrar:
    - [ ] Receita Prevista: R$ XXX.XX
    - [ ] Receita Realizada: R$ XXX.XX
    - [ ] Pagamentos Pendentes: R$ XXX.XX
    - [ ] Horas Agendadas esta Semana: X h
  
Status: [ ] ✅ [ ] ⚠️ [ ] ❌
Notas: ___________
```

### 2.2 Mock Mode: Vazio

```gherkin
Cenário: Carregar perfil Vazio
  Dado: Dashboard aberto
  Quando: Click botão "Vazio"
  Então:
    - [ ] Nenhum aviso deve aparecer (0 dados existentes)
    - [ ] Todos arrays ficam vazios
    - [ ] Dashboard mostra "Nenhuma data"
    - [ ] Onboarding steps reset para não concluído
  
Status: [ ] ✅ [ ] ⚠️ [ ] ❌
Notas: ___________
```

### 2.3 Mock Mode: Demo

```gherkin
Cenário: Carregar perfil Demo
  Dado: Modo "Vazio" ativo
  Quando: Click botão "Demo"
  Então:
    - [ ] Card aviso mostra: "Cuidado: Dados serão perdidos"
    - [ ] Mostra count: "0 alunos, 0 locais, 0 turmas"
    - [ ] 2 botões: Cancelar + "Apagar e Trocar"
    - [ ] Click Cancelar → aviso desaparece, modo não muda
    - [ ] Click "Apagar e Trocar" → carrega Demo data
    - [ ] Dashboard mostra 4 alunos, 4 locais, 3 turmas
  
Status: [ ] ✅ [ ] ⚠️ [ ] ❌
Notas: ___________
```

### 2.4 Mock Mode: Reset

```gherkin
Cenário: Reset dos dados atuais
  Dado: Demo mode com dados editados
  Quando: Edit 1 aluno (ex: mudar nome)
  E: Click "Reset"
  Então:
    - [ ] Aluno volta ao nome original
    - [ ] Todos dados reset para Demo inicial
    - [ ] Sem aviso (reset = restore, não perde)
  
Status: [ ] ✅ [ ] ⚠️ [ ] ❌
Notas: ___________
```

---

## 👥 Seção 3: Alunos (Students)

### 3.1 CRUD Básico

```gherkin
Cenário: Criar novo aluno
  Dado: StudentsPage aberta
  Quando: Click "Novo Aluno"
  E: Preenche form:
    - Nome: "João Silva"
    - Email: "joao@email.com"
    - Telefone: "11999999999"
    - Status: "Ativo"
    - Modelo Cobrança: "Por Aula"
    - Valor/Hora: "100"
  E: Click "Criar"
  Então:
    - [ ] Modal fecha
    - [ ] Novo aluno aparece na tabela
    - [ ] Dados persistem em localStorage
    - [ ] Refresh página → dados continuam
  
Status: [ ] ✅ [ ] ⚠️ [ ] ❌
Notas: ___________
```

### 3.2 Editar Aluno

```gherkin
Cenário: Editar aluno existente
  Dado: Aluno exist (nome="João")
  Quando: Click ícone edit
  E: Muda nome para "João Pedro"
  E: Click "Salvar"
  Então:
    - [ ] Modal fecha
    - [ ] Aluno atualizado na tabela
    - [ ] localStorage reflete mudança
  
Status: [ ] ✅ [ ] ⚠️ [ ] ❌
Notas: ___________
```

### 3.3 Deletar com Cascata

```gherkin
Cenário: Deletar aluno remove dados relacionados
  Dado: Demo mode com:
    - Student "Maria" (id=s1)
    - Payment relacionado a Maria
  Quando: Delete "Maria"
  E: Confirm "Deletar?"
  Então:
    - [ ] Aluno removido de /students
    - [ ] Navega para /payments
    - [ ] Payment relacionado também foi removido ✅ (CASCATA)
    - [ ] Search por "Maria" no payments retorna zero
  
Status: [ ] ✅ [ ] ⚠️ [ ] ❌
Notas: ___________
```

### 3.4 Busca & Filtro

```gherkin
Cenário: Buscar e filtrar alunos
  Dado: 4 alunos carregados
  Quando: Type "João" no campo de busca
  Então:
    - [ ] Filtra apenas alunos com "João" no nome
    - [ ] Mostra apenas 1 ou 0 resultados
  
  Quando: Limpa busca
  E: Seleciona Status = "Pausado"
  Então:
    - [ ] Mostra apenas alunos com status PAUSED
    - [ ] Count atualiza
  
Status: [ ] ✅ [ ] ⚠️ [ ] ❌
Notas: ___________
```

### 3.5 Validação Form

```gherkin
Cenário: Validação de campos obrigatórios
  Dado: Form novo aluno aberto
  Quando: Deixa Nome vazio
  E: Click "Criar"
  Então:
    - [ ] Alert: "Preencha todos os campos obrigatórios"
    - [ ] Modal não fecha
  
Status: [ ] ✅ [ ] ⚠️ [ ] ❌
Notas: ___________
```

---

## 📍 Seção 4: Locais (Locations)

### 4.1 CRUD

```gherkin
Cenário: Criar e deletar local
  Dado: LocationsPage
  Quando: Click "Novo Local"
  E: Nome: "Escola XYZ"
  E: Tipo: "Escola"
  E: Click "Criar"
  Então:
    - [ ] Local aparece no grid
    - [ ] Card mostra informações corretas
  
  Quando: Clica delete
  E: Confirma
  Então:
    - [ ] ✅ Local removido
    - [ ] ✅ Groups relacionados também são removidos
    - [ ] Navega para /groups → nenhuma turma referencia local deletado
  
Status: [ ] ✅ [ ] ⚠️ [ ] ❌
Notas: ___________
```

### 4.2 Tipos de Local

```gherkin
Cenário: Diferentes tipos de local
  Dado: Criar locais com tipos diferentes
  Quando: Tipo = "Particular"
  Então:
    - [ ] Card tem background azul (PARTICULAR)
  
  Quando: Tipo = "Escola"
  Então:
    - [ ] Card tem background roxo (SCHOOL)
  
  Quando: Tipo = "Online"
  Então:
    - [ ] Card tem background cyan (ONLINE)
  
Status: [ ] ✅ [ ] ⚠️ [ ] ❌
Notas: ___________
```

---

## 👨‍🎓 Seção 5: Turmas (Groups)

### 5.1 Criar Turma (com validação)

```gherkin
Cenário: Criar turma requer local
  Dado: Modo Vazio
  Quando: Navega para /groups
  E: Click "Nova Turma"
  Então:
    - [ ] Alert: "Você precisa cadastrar pelo menos um local"
    - [ ] Botão fica desabilitado
  
  Quando: Cadastra um local
  E: Volta para /groups
  E: Click "Nova Turma"
  Então:
    - [ ] Modal abre
    - [ ] Dropdown "Local" mostra 1 opção
    - [ ] NÃO mostra "Nenhuma opção disponível"
  
Status: [ ] ✅ [ ] ⚠️ [ ] ❌
Notas: ___________
```

### 5.2 CRUD Turma

```gherkin
Cenário: CRUD turma completo
  Dado: Demo mode
  Quando: Edita turma (ex: capacidade 20 → 25)
  E: Click "Salvar"
  Então:
    - [ ] Turma atualizada no card
    - [ ] Mostra "25 alunos" (capacidade)
  
  Quando: Deleta turma
  Então:
    - [ ] ✅ Turma removida
    - [ ] ✅ Schedules relacionados também removidos
    - [ ] Calendário não mostra aulas dessa turma
  
Status: [ ] ✅ [ ] ⚠️ [ ] ❌
Notas: ___________
```

---

## 📅 Seção 6: Calendário (3 Visões)

### 6.1 Visão Dia

```gherkin
Cenário: Navegar por dias
  Dado: CalendarPage, view = "Dia"
  Então:
    - [ ] Mostra data em português (ex: "Segunda, 24 de fevereiro")
    - [ ] Botões ← e → para anterior/próximo dia
    - [ ] Aulas do dia listadas em grid
  
  Quando: Click ← (dia anterior)
  Então:
    - [ ] Data muda para dia anterior
    - [ ] Aulas dessa data aparecem
  
  Quando: Click → múltiplas vezes
  Então:
    - [ ] Data avança dia por dia
    - [ ] Sem erros (data não fica inválida)
  
Status: [ ] ✅ [ ] ⚠️ [ ] ❌
Notas: ___________
```

### 6.2 Visão Semana

```gherkin
Cenário: Calendario em visão semana
  Dado: Calendar view = "Semana"
  Então:
    - [ ] Mostra grid 7x colunas (Mon-Sun)
    - [ ] Cabeçalho mostra "dd/mm até dd/mm"
    - [ ] Dias atuais têm borda azul
    - [ ] Aulas aparecem em seus respectivos dias
  
  Quando: Click ← (semana anterior)
  Então:
    - [ ] Calendário volta 7 dias
    - [ ] Header date atualiza
  
Status: [ ] ✅ [ ] ⚠️ [ ] ❌
Notas: ___________
```

### 6.3 Visão Mês

```gherkin
Cenário: Calendario em visão mês
  Dado: Calendar view = "Mês"
  Então:
    - [ ] Mostra 30-31 dias em grid 7x
    - [ ] Header: mês/ano (ex: "Fevereiro 2026")
    - [ ] Dias anteriores/posteriores em cor cinza (muted)
    - [ ] Hoje tem borda azul
  
  Quando: Dia tem 3+ aulas
  Então:
    - [ ] Mostra primeiras 2 aulas
    - [ ] Badge "+1 mais" aparece
  
  Quando: Click +1 mais
  Então:
    - [ ] Abre modal com todas aulas do dia (ou navega para dia)
  
  Quando: Click → (próximo mês)
  Então:
    - [ ] Calendário avança 30 dias
    - [ ] Mês no header atualiza
  
Status: [ ] ✅ [ ] ⚠️ [ ] ❌
Notas: ___________
```

### 6.4 Status de Aula

```gherkin
Cenário: Mudar status da aula
  Dado: Aula com status "PLANNED"
  Quando: Click aula (abre modal)
  E: Dropdown status muda para "COMPLETED"
  E: Click "Salvar"
  Então:
    - [ ] Modal fecha
    - [ ] Aula agora mostra badge "Concluída" (verde)
    - [ ] Status reflete em Dashboard (receita realizada aumenta)
  
Status: [ ] ✅ [ ] ⚠️ [ ] ❌
Notas: ___________
```

---

## 💰 Seção 7: Pagamentos (Payments)

### 7.1 Filtros

```gherkin
Cenário: Filtrar pagamentos
  Dado: PaymentsPage com múltiplos pagamentos
  Quando: Status = "Pendente"
  Então:
    - [ ] Mostra apenas PENDING
    - [ ] Resumo no topo reflete (Pendentes = X)
  
  Quando: Mês = Março 2026
  Então:
    - [ ] Mostra apenas pagamentos em março
    - [ ] Others meses desaparecem
  
Status: [ ] ✅ [ ] ⚠️ [ ] ❌
Notas: ___________
```

### 7.2 Marcar como Pago

```gherkin
Cenário: Marcar pagamento como pago
  Dado: Payment com status PENDING
  Quando: Click "Marcar como Pago"
  Então:
    - [ ] Status muda para "PAID" (verde)
    - [ ] Badge muda
    - [ ] Paid date é preenchido (hoje)
  
Status: [ ] ✅ [ ] ⚠️ [ ] ❌
Notas: ___________
```

### 7.3 Cascata Orfandade

```gherkin
Cenário: Deletar aluno com payments
  Dado: Student com Payment pendente
  Quando: Delete Student
  E: Navega para /payments
  Então:
    - [ ] ✅ Payment também foi deletado
    - [ ] Sem dados órfãos referenciando student
  
Status: [ ] ✅ [ ] ⚠️ [ ] ❌
Notas: ___________
```

---

## 🌙 Seção 8: Dark Mode & Responsividade

### 8.1 Dark Mode Toggle

```gherkin
Cenário: Alternar dark mode
  Dado: App em light mode
  Quando: Click ícone lua (top-right)
  Então:
    - [ ] Background fica escuro (slate-900)
    - [ ] Texto fica branco/cinza-claro
    - [ ] Todos elementos têm dark: prefixes
    - [ ] Modals escuros
    - [ ] Cards escuros
  
  Quando: Refresh página
  Então:
    - [ ] Dark mode persiste (localStorage)
  
Status: [ ] ✅ [ ] ⚠️ [ ] ❌
Notas: ___________
```

### 8.2 Responsividade Mobile

```gherkin
Cenário: Layout mobile (xs/sm)
  Dado: Browser em 375px (iPhone)
  Quando: Acessa cualquer página
  Então:
    - [ ] Sidebar colapsada (hamburger menu)
    - [ ] Tabelas em cards verticais
    - [ ] Botões empilhados
    - [ ] Sem horizontal scroll
    - [ ] Texto ajustado (sm:text-base)
  
Status: [ ] ✅ [ ] ⚠️ [ ] ❌
Notas: ___________
```

---

## ⚠️ Seção 9: Edge Cases & Validações

### 9.1 Orphaned Data Prevention

```gherkin
Cenário: Cascata delete completa
  Setup: Demo mode
  
  Test 1: Delete Student
    - [ ] Remove Payments de esse student
    - [ ] Remove Schedules de esse student
    - [ ] Remove Lessons dessas schedules
  
  Test 2: Delete Location with Groups
    - [ ] Remove Groups
    - [ ] Remove Schedules dessas groups
    - [ ] Remove Lessons
  
  Test 3: Delete Schedule
    - [ ] Remove Lessons of that schedule
  
Status: [ ] ✅ [ ] ⚠️ [ ] ❌
Notas: ___________
```

### 9.2 Dropdown Empty States

```gherkin
Cenário: Dropdowns vazios mostram status
  Dado: Modo Vazio
  Quando: Abre form novo grupo
  E: Dropdown "Local"
  Então:
    - [ ] Placeholder: "Nenhuma opção disponível"
    - [ ] Campo desabilitado (opacity 60%)
    - [ ] Helper text: "Nenhuma opção disponível"
  
Status: [ ] ✅ [ ] ⚠️ [ ] ❌
Notas: ___________
```

### 9.3 Formulário Vazio

```gherkin
Cenário: Criar aluno com campos obrigatórios
  Dado: Form aberto
  Quando: Deixa Nome vazio
  E: Click "Criar"
  Então:
    - [ ] Alert: "Preencha todos os campos obrigatórios"
    - [ ] Modal não fecha
  
  Quando: Posta todos campos
  E: Click "Criar"
  Então:
    - [ ] ✅ Aluno criado
    - [ ] Modal fecha
  
Status: [ ] ✅ [ ] ⚠️ [ ] ❌
Notas: ___________
```

---

## 🧹 Seção 10: Limpeza & Segurança

### 10.1 localStorage Integrity

```gherkin
Cenário: localStorage persiste dados
  Dado: Demo mode, edita 1 aluno
  Quando: Refresh página (F5)
  Então:
    - [ ] Aluno editado continua com mudanças
    - [ ] Todos dados intactos
    - [ ] Nenhum reload/reset involuntário
  
  Quando: Logout
  E: Check localStorage
  Então:
    - [ ] User removido
    - [ ] Tokens removidos (se houver)
    - [ ] AppData ainda existe? (Design decision)
  
Status: [ ] ✅ [ ] ⚠️ [ ] ❌
Notas: ___________
```

### 10.2 Error Handling

```gherkin
Cenário: Erro em operações
  Dado: App em estado normal
  Quando: Abre console (DevTools)
  Então:
    - [ ] Sem erros na console
    - [ ] Sem warnings não-esperados
  
Status: [ ] ✅ [ ] ⚠️ [ ] ❌
Notas: ___________
```

---

## 📝 Seção 11: Performance

### 11.1 Velocidade de Operações

```gherkin
Cenário: Operações respondem rapidamente
  Dado: Demo mode
  Quando: Create student
  Então: Responde em < 500ms
  
  Quando: Delete student with cascata
  Então: Responde em < 500ms
  
  Quando: Switch mock mode
  Então: Responde em < 1s
  
Status: [ ] ✅ [ ] ⚠️ [ ] ❌
Notas: ___________
```

---

## 🏁 Resumo de Testes

### Total de Testes

- **Authentication:** 3
- **Onboarding:** 1
- **Dashboard:** 4
- **Students:** 5
- **Locations:** 2
- **Groups:** 2
- **Calendar:** 4
- **Payments:** 3
- **Dark Mode:** 2
- **Edge Cases:** 3
- **Security:** 2
- **Performance:** 1

**Total:** 32 test scenarios

### Resultado Final

```
Testes Passed:    [ ] __ / 32
Testes Failed:    [ ] __ / 32
Bloqueadores:     [ ] __ / 32
Warnings:         [ ] __ / 32
```

### Sign-Off

**Tester Name:** _______________________  
**Date:** _______________________  
**Status:** [ ] APPROVED [ ] MINOR ISSUES [ ] BLOCKED  

**Comments:**  
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

**Próxima Ação:** Enviar relatório para equipe de QA/Product Owner
