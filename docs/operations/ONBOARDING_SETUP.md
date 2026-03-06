# Onboarding Wizard - Setup Guide

## 📋 Visão Geral

O sistema de **Onboarding Wizard** personaliza a experiência inicial do TeacherFlow com base na profissão do usuário.

### ✨ Funcionalidades

- **8 Categorias de Profissão**: Música, Idiomas, Acadêmico, Esportes, Artes, Tecnologia, Negócios, Bem-estar
- **80+ Especialidades**: Instrumento, matéria, esporte, habilidade específica
- **Sugestões Personalizadas**: Turmas sugeridas, locais recomendados, faixas de preço
- **Navegação Guiada**: Wizard com 4 steps (Categoria → Especialidade → Confirmação → Sugestões)

---

## 🚀 Configuração do Backend

### 1. Executar Migrações do Banco de Dados

As migrações adicionam os campos necessários ao modelo `User`:

```bash
cd backend

# Verificar qual versão está aplicada
alembic current

# Aplicar todas as migrações pendentes
alembic upgrade head
```

### 2. Campos Adicionados ao User Model

```python
# backend/app/models.py - Classe User
onboarding_completed = Column(Boolean, default=False)
onboarding_completed_at = Column(DateTime, nullable=True)
profession_category = Column(String, nullable=True)  # music, language, academic, etc.
profession_sub_category = Column(String, nullable=True)  # Piano, Violão, etc.
```

### 3. Endpoints Disponíveis

#### `GET /api/onboarding/categories`
Lista todas as 8 categorias de profissão.

**Resposta:**
```json
[
  {
    "key": "music",
    "name": "Música",
    "icon": "🎵",
    "sub_categories": ["Piano", "Violão", "Guitarra", ...]
  },
  ...
]
```

#### `GET /api/onboarding/categories/{category_key}`
Detalhes e sugestões para uma categoria específica.

**Resposta:**
```json
{
  "category": "music",
  "name": "Música",
  "icon": "🎵",
  "sub_categories": ["Piano", "Violão", ...],
  "suggestions": {
    "groups": [
      {
        "name": "Aula Individual de Piano",
        "hourly_rate": 120,
        "max_students": 1
      }
    ],
    "locations": [
      {"name": "Estúdio do Professor"},
      {"name": "Casa do Aluno"}
    ],
    "pricing": {
      "min": 80,
      "max": 200,
      "suggested": 120,
      "unit": "por hora"
    }
  }
}
```

#### `POST /api/onboarding/complete`
Salva a profissão do usuário e marca onboarding como completo.

**Request Body:**
```json
{
  "category_key": "music",
  "sub_category": "Piano"
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Bem-vindo! Configuração inicial para Piano salva com sucesso.",
  "suggestions": { ... }
}
```

#### `GET /api/onboarding/status`
Verifica se o usuário completou o onboarding.

**Resposta (completado):**
```json
{
  "completed": true,
  "profession": {
    "category": "music",
    "category_name": "Música",
    "sub_category": "Piano",
    "completed_at": "2025-01-15T10:30:00"
  }
}
```

**Resposta (não completado):**
```json
{
  "completed": false,
  "profession": null,
  "next_steps": [
    "Select your profession category",
    "Choose your specialty",
    "Get personalized setup suggestions"
  ]
}
```

---

## 🎨 Frontend

### 1. Componente Principal

O wizard está em `frontend/src/components/OnboardingWizard.tsx` e é renderizado pela página `OnboardingPage.tsx`.

### 2. Fluxo do Wizard

```
Step 1: Categoria (8 cards com ícones)
   ↓
Step 2: Especialidade (dropdown de sub-categorias)
   ↓
Step 3: Confirmação (resumo + explicação de benefícios)
   ↓
Step 4: Sugestões (turmas, locais, preços personalizados)
   ↓
Redirecionamento para Dashboard
```

### 3. Integração com Auth

Após completar o onboarding, o campo `onboardingComplete` no `authStore` é atualizado para `true`, permitindo acesso ao dashboard.

```tsx
// App.tsx verifica se onboarding foi completado
{!user?.onboardingComplete ? (
  <Routes>
    <Route path="/onboarding" element={<OnboardingPage />} />
    <Route path="*" element={<Navigate to="/onboarding" />} />
  </Routes>
) : (
  // Rotas do dashboard
)}
```

---

## 📊 Taxonomia de Profissões

### 🎵 Música
Piano, Violão, Guitarra, Bateria, Baixo, Canto, Teclado, Flauta, Saxofone, Violino, Ukulele, Teoria Musical

### 🌍 Idiomas
Inglês, Espanhol, Francês, Alemão, Italiano, Português, Mandarim, Japonês, Coreano, Russo, Árabe

### 📚 Acadêmico
Matemática, Física, Química, Biologia, História, Geografia, Literatura, Filosofia, Sociologia, Redação, Reforço Escolar, Pré-ENEM/Vestibular

### ⚽ Esportes
Futebol, Natação, Tênis, Vôlei, Basquete, Artes Marciais, Yoga, Musculação, Corrida, Pilates, Dança, Crossfit

### 🎨 Artes
Desenho, Pintura, Escultura, Fotografia, Design Gráfico, Ilustração Digital, Aquarela, Arte Urbana, Cerâmica

### 💻 Tecnologia
Programação Python, JavaScript, Excel/Planilhas, Design UI/UX, Edição de Vídeo, Marketing Digital, WordPress/Criação de Sites, Photoshop/Edição de Imagem, Data Science, DevOps

### 💼 Negócios
Finanças Pessoais, Empreendedorismo, Marketing, Vendas, Gestão de Projetos, Contabilidade, Recursos Humanos, Análise de Dados, E-commerce

### 🧘 Bem-estar
Meditação, Mindfulness, Terapia Holística, Nutrição, Coaching de Vida, Aconselhamento, Massoterapia, Reiki, Aromaterapia

---

## 🔍 Verificação de Funcionamento

### 1. Backend
```bash
# Testar endpoint de categorias
curl http://localhost:8000/api/onboarding/categories

# Testar categoria específica
curl http://localhost:8000/api/onboarding/categories/music

# Verificar status de onboarding (autenticado)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/onboarding/status
```

### 2. Frontend
1. Faça login no TeacherFlow
2. Se `onboardingComplete = false`, você será redirecionado para `/onboarding`
3. Complete os 4 steps do wizard
4. Verifique se foi redirecionado para o dashboard

---

## 🗄️ Estrutura do Banco de Dados

### Migrações Aplicadas

```
001_add_verification_codes.py
  ↓
002_add_profession_fields.py  ← NOVA MIGRAÇÃO
```

### Verificar Schema

```sql
-- PostgreSQL
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND column_name IN (
    'onboarding_completed',
    'onboarding_completed_at',
    'profession_category',
    'profession_sub_category'
  );
```

**Resultado esperado:**
```
onboarding_completed      | boolean  | NO
onboarding_completed_at   | timestamp| YES
profession_category       | varchar  | YES
profession_sub_category   | varchar  | YES
```

---

## 🐛 Troubleshooting

### Erro: "alembic.util.exc.CommandError: Can't locate revision identified by..."
```bash
# Resetar histórico de migrações (CUIDADO: só em desenvolvimento!)
alembic downgrade base
alembic upgrade head
```

### Erro: "User has no attribute 'onboarding_completed'"
Verifique se a migração foi aplicada:
```bash
alembic current  # Deve mostrar 002_add_profession_fields
```

### Usuário não é redirecionado para onboarding
- Verifique se o campo `onboardingComplete` no `authStore` está correto
- Inspecione o App.tsx: a condição `!user?.onboardingComplete` deve ser verdadeira
- No backend, verifique se o campo `onboarding_completed` no banco está `false`

### Frontend não carrega categorias
- Verifique se o backend está rodando: `http://localhost:8000/docs`
- Teste o endpoint manualmente: `GET /api/onboarding/categories`
- Verifique erros no console do navegador (F12)

---

## 📈 Próximos Passos

1. **Task 7**: Implementar schema de assinaturas (Free, Pro, Premium)
2. **Task 8**: Criar APIs de gestão de assinaturas
3. **Security Phase 1**: Implementar correções críticas de segurança
4. **Analytics**: Adicionar tracking de categorias mais populares

---

## 🎯 Checklist de Implementação

- ✅ Backend: Modelo User com campos de profissão
- ✅ Backend: Migração Alembic 002_add_profession_fields
- ✅ Backend: Serviço de onboarding com taxonomia de profissões
- ✅ Backend: 4 endpoints de API (categories, category details, complete, status)
- ✅ Frontend: Componente OnboardingWizard com 4 steps
- ✅ Frontend: Integração com authStore
- ✅ Frontend: Redirecionamento automático no App.tsx
- ⏳ Testing: Testes E2E do fluxo de onboarding
- ⏳ Documentation: API docs no Swagger/OpenAPI

---

**Implementado em:** 2025-01-15  
**Backend:** FastAPI + SQLAlchemy + Alembic  
**Frontend:** React + TypeScript + Tailwind CSS
