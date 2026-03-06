# Google OAuth Setup - 5 Minutes

**Goal:** Permitir login via Google no TeacherFlow

---

## PASSO 1: Criar Google OAuth App (5 min)

### 1.1 Vá para Google Cloud Console
- URL: https://console.cloud.google.com/
- Faça login com sua conta Google

### 1.2 Criar novo projeto
1. Clique em "Select a Project" → "NEW PROJECT"
2. Nome: `TeacherFlow` (ou seu nome)
3. Clique "CREATE"
4. Aguarde criar (2-3 min)

### 1.3 Habilitar Google Sign-In API
1. Pesquise por: **Google Identity Services**
2. Clique no resultado (Google Identity Services)
3. Clique em "ENABLE"

### 1.4 Criar OAuth Credentials
1. Menu esquerdo → **Credentials**
2. Clique "CREATE CREDENTIALS" → "OAuth 2.0 Client IDs"
3. Se pedir tipo: escolha **Web application**
4. Nome: `TeacherFlow Web`
5. **Authorized JavaScript origins** (adicione):
   ```
   http://localhost:5173
   http://localhost:3000
   https://teacherflow.vercel.app
   ```
6. **Authorized redirect URIs** (deixe vazio - não precisa para Google Sign-In)
7. Clique "CREATE"
8. **Copie o Client ID** (algo como: `123456789-abc...apps.googleusercontent.com`)

---

## PASSO 2: Configurar no TeacherFlow (2 min)

### 2.1 Arquivo `.env.local` do frontend

Abra: `c:\Users\Hugo Souza\OneDrive\Documentos\Python Scripts\teacherflow\frontend\.env.local`

Adicione (no final do arquivo):
```dotenv
# Google OAuth - Cole seu Client ID aqui
VITE_GOOGLE_CLIENT_ID=SEU_CLIENT_ID_AQUI
```

**Exemplo real:**
```dotenv
VITE_GOOGLE_CLIENT_ID=1234567890-abcdefghijklmnop.apps.googleusercontent.com
```

---

## PASSO 3: Testar (1 min)

1. Abra http://localhost:5173/login
2. Clique em "Google Sign-In"
3. Selecione sua conta Google
4. Pronto! ✅

---

## TROUBLESHOOTING

### Erro: "localhost refused to connect"
- Certifique que frontend está rodando: `npm run dev`
- Verifique porta: `http://localhost:5173`

### Erro: "Invalid OAuth configuration"
- Verifique se Client ID está correto
- Verifique se `http://localhost:5173` está em "Authorized JavaScript origins"
- Limpe cache do navegador (Ctrl+Shift+Delete)

### Erro: "Invalid Client ID"
- Copie exatamente o Client ID do Google Cloud Console
- Não deixe espaços em branco
- Reinicie `npm run dev`

---

## Pronto! ✅

Agora seus usuários podem fazer login via Google! 🎉

---

## Para Produção (Depois)

Quando fizer deploy para `https://teacherflow.vercel.app`:
1. Volte ao Google Cloud Console
2. Vá em Credentials
3. Edite o OAuth 2.0 Client ID
4. Adicione `https://teacherflow.vercel.app` em **Authorized JavaScript origins**
5. Pronto! Login Google funciona online também.
