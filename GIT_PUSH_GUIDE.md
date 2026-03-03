# Git Push - Instruções Passo-a-Passo

Seu commit foi criado com sucesso! Agora falta configurar a origem remota e fazer o push.

## PASSO 1: Criar Repositório no GitHub (5 min)

1. Vá para: https://github.com/new
2. Preencha:
   - **Repository name:** `teacherflow`
   - **Description:** TeacherFlow - Gestão de aulas e pagamentos
   - **Visibility:** Public (recomendado para deploy automático)
   - **Initialize with README:** ❌ NÃO marque (já temos arquivos)
3. Clique "Create repository"
4. Copie a URL que aparecerá (algo como: `https://github.com/HugoLoyalConsulting/teacherflow-backend.git`)

## PASSO 2: Adicionar Remote (2 min)

No PowerShell, substitua `seu-usuario` pela sua conta GitHub:

```powershell
cd 'c:\Users\Hugo Souza\OneDrive\Documentos\Python Scripts\teacherflow'

git remote remove origin  # Remove o placeholder que adicionamos

git remote add origin https://github.com/HugoLoyalConsulting/teacherflow-backend.git
```

**Exemplo real:**
```powershell
git remote add origin https://github.com/HugoLoyalConsulting/teacherflow-backend.git
```

## PASSO 3: Fazer Push (5 min - pode pedir autenticação)

```powershell
git push -u origin master
```

Se pedir **autenticação**:
- Use seu **usuário GitHub** como username
- Use um **Personal Access Token** (PAT) como password:
  - Vá para: https://github.com/settings/tokens
  - Clique "Generate new token (classic)"
  - Marque: `repo`, `workflow`
  - Copie o token gerado
  - Cole como password

**Resultado esperado:**
```
Enumerating objects: XXX, done.
Counting objects: 100% (XXX/XXX), done.
...
To https://github.com/HugoLoyalConsulting/teacherflow-backend.git
 * [new branch]      master -> master
Branch 'master' set up to track remote tracking branch 'master' from 'origin'.
```

## PASSO 4: Renomear para "main" (Opcional mas Recomendado)

GitHub agora usa `main` como branch padrão:

```powershell
git branch -M main
git push -u origin main
```

---

## Resumo Rápido (Se souber sua URL GitHub):

```powershell
cd 'c:\Users\Hugo Souza\OneDrive\Documentos\Python Scripts\teacherflow'

# Substitua sua-url-aqui
git remote remove origin
git remote add origin sua-url-aqui

# Fazer push
git push -u origin master
```

---

## Depois do Push:

✅ GitHub Actions vai automaticamente:
1. Testar o código
2. Deploy frontend → Vercel
3. Deploy backend → Render
4. Auto-seed no banco de dados

Você pode acompanhar em: https://github.com/HugoLoyalConsulting/teacherflow-backend/actions
