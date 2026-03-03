# Google OAuth Setup Guide

Para ativar o login via Gmail no TeacherFlow, siga estes passos:

## 1. Criar Projeto no Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Crie um novo projeto ou selecione um existente
3. Vá para **APIs & Services** > **Credentials**
4. Clique em **Create Credentials** > **OAuth Client ID**
5. Selecione **Web application** como tipo de aplicação
6. Configure as URIs autorizadas:
   - **Authorized JavaScript origins:**
     - `http://localhost:5173` (para desenvolvimento local)
     - `https://seu-dominio.com` (para produção)
   - **Authorized redirect URIs:**
     - `http://localhost:5173` (para desenvolvimento local)
     - `https://seu-dominio.com` (para produção)
7. Copie o **Client ID** gerado

## 2. Configurar Variáveis de Ambiente

### Para Desenvolvimento
1. Crie um arquivo `.env.local` na raiz do projeto (não será commitado)
2. Adicione a variável:
```env
VITE_GOOGLE_CLIENT_ID=seu_client_id_aqui
```

### Para Produção
1. Defina a variável de ambiente no seu provider de hosting (Vercel, Netlify, etc.)
2. Nome da variável: `VITE_GOOGLE_CLIENT_ID`
3. Valor: seu Client ID

## 3. Testando Localmente

1. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

2. Abra `http://localhost:5173` no navegador
3. Na página de login, você verá:
   - Formulário de email/senha
   - Botão "Sign in with Google" (se o Client ID estiver configurado)
4. Clique no botão do Google e complete a autenticação

## 4. Funcionamento

- O login via Google decodifica o JWT token fornecido pelo Google
- Uma conta é criada automaticamente com os dados do perfil do Google
- O email e nome do usuário são obtidos do perfil do Google
- A conta é criada com `tenantId` derivado do usuário (ex: `tenant-nome`)

## Note Importante

- **Desenvolvimento:** Se não houver `VITE_GOOGLE_CLIENT_ID`, o botão de Google não aparece
- **Demonstração:** O botão só é renderizado se as credenciais estiverem configuradas
- **Segurança:** O token JWT é decodificado no cliente; em produção, você deve validar no backend

## Troubleshooting

### Botão do Google não aparece?
- Verifique se o `VITE_GOOGLE_CLIENT_ID` está configurado
- Reinicie o servidor de desenvolvimento (`npm run dev`)

### Erro ao fazer login com Google?
- Confirme que o Client ID está correto
- Verifique se o domínio está autorizado no Google Cloud Console
- Verifique as permissões de cookies/localStorage no navegador

### Erro de CORS?
- Adicione seu domínio às **Authorized JavaScript origins** no Google Cloud Console

## Recursos Úteis

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [react-oauth/google Documentation](https://www.npmjs.com/package/@react-oauth/google)
- [Google Cloud Console](https://console.cloud.google.com)
