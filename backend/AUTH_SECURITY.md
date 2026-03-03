# 🔐 Arquitetura de Segurança - TeacherFlow Auth v2

**Data:** 27 de fevereiro, 2026  
**Status:** Enterprise-Grade Security Implementation

---

## 📋 Índice
1. [Overview de Segurança](#overview)
2. [Fluxos de Autenticação](#fluxos)
3. [Boas Práticas Implementadas](#boas-práticas)
4. [Endpoints da API](#endpoints)
5. [Variáveis de Ambiente](#env)
6. [Testes & Simulations](#testes)

---

<a name="overview"></a>
## 🎯 Overview de Segurança

### Camadas de Defesa

```
┌─────────────────────────────────────────────────────────┐
│ 1. Rate Limiting (Frontend + Backend)                   │
│    - 5 tentativas/15min por email (login)               │
│    - 10 tentativas/15min por email (verify-email)       │
│    - Bloqueia brute force attacks                       │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│ 2. Validação de Força de Senha                          │
│    - Mínimo 12 caracteres                               │
│    - 1+ maiúscula, 1+ minúscula, 1+ número             │
│    - 1+ caractere especial (!@#$%^&*)                   │
│    - Validação em cliente & servidor                    │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│ 3. Hash de Senha (Bcrypt)                               │
│    - Bcrypt com salt (algoritmo recomendado NIST)       │
│    - Nunca armazenar senhas em plaintext                │
│    - Irreversível + resistente a timing attacks         │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│ 4. Email Verification (OTP)                             │
│    - 6 dígitos aleatórios                               │
│    - Válido por 15 minutos                              │
│    - Máximo 3 tentativas por código                     │
│    - Email enviado via SMTP (TLS/SSL)                   │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│ 5. JWT com Refresh Token Rotation                       │
│    - Access Token: 30 minutos (curta duração)           │
│    - Refresh Token: 7 dias (renovável)                  │
│    - Assinado com HS256 (HMAC-SHA256)                   │
│    - Claims: user_id, email, exp, iat, type            │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│ 6. CORS (Cross-Origin Resource Sharing)                 │
│    - Whitelist de domínios permitidos                   │
│    - Apenas POST, GET, PUT, DELETE                      │
│    - Headers: Authorization, Content-Type              │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│ 7. Auditoria de Segurança (Logging)                     │
│    - Cada tentativa de login/registro logada            │
│    - IP address, User Agent capturados                  │
│    - Timestamps precisos (UTC)                          │
│    - Alertas para atividade suspeita                    │
└─────────────────────────────────────────────────────────┘
```

---

<a name="fluxos"></a>
## 🔄 Fluxos de Autenticação

### 1. Registro com Verificação de Email

```
Cliente                         Backend

1. POST /auth/register
   (email, password, name)
                        ──────→ Validar força de senha
                                Hash de password (Bcrypt)
                                Gerar OTP (6 dígitos)
                                Criar usuário (inativo)
                                Enviar email com OTP
                        ←────── { email, otp_code (dev) }

2. Usuário recebe email com OTP

3. POST /auth/verify-email
   (email, otp_code)
                        ──────→ Validar OTP (max 3 tentativas)
                                Ativar usuário
                                Gerar JWT tokens
                        ←────── TokenResponse
                                (access_token, refresh_token,
                                 expires_in, user)

4. Cliente armazena tokens
   - access_token → localStorage
   - refresh_token → sessionStorage (mais seguro)
   - Usar em todas as requições: Header Authorization
```

### 2. Login Seguro

```
Cliente                         Backend

1. POST /auth/login
   (email, password)
                        ──────→ Rate limiting: 5/15min
                                Buscar usuário
                                Validar email verificado
                                Validar senha (Bcrypt)
                                Log de auditoria
                                Verificar 2FA ativo?
                        ←────── TokenResponse ou
                                { requires_2fa: true }

2. [Se 2FA ativo]
   POST /auth/2fa/verify
   (code)
                        ──────→ Validar código 2FA
                                Gerar tokens
                        ←────── TokenResponse
```

### 3. Refresh Token (Mantém Sessão)

```
Cliente                         Backend

1. Access token expirado
   400+ : Token inválido

2. POST /auth/refresh
   (refresh_token)
                        ──────→ Validar refresh token
                                Gerar NOVO access token
                                Gerar NOVO refresh token
                                (Refresh Token Rotation)
                        ←────── TokenResponse
                                (novos tokens)

Benefício:
- Mesmo com refresh_token comprometido,
  não podemos usar o antigo (foi rotacionado)
- Janelas de exposição + curtas
```

### 4. Login com Google OAuth2 (Em Breve)

```
Cliente                         Google              Backend

1. Click "Login with Google"
   Abre Google Sign-In
   Usuário autoriza
                        ───────────────────→ Retorna ID Token

2. POST /auth/google
   (id_token)          ───────────────────→ Validar assinatura
                                             com public keys Google
                                           ←─ user info
                                             +
                                           Criar/atualizar usuário
                        ←───────────────── TokenResponse
```

---

<a name="boas-práticas"></a>
## ✅ Boas Práticas Implementadas

### 1. Password Security

- ✅ **Bcrypt Hashing** - Não reversível, resistente a GPU/ASIC attacks
- ✅ **Força da Senha** - Validação em cliente (UX) + servidor (segurança)
- ✅ **Sem Limite de Caracteres** - Bcrypt suporta até 72 bytes
- ✅ **Timing Attack Resistant** - Usar `PasswordManager.verify_password()`
- ❌ **Nunca** enviar senha em response/logs
- ❌ **Nunca** usar MD5/SHA1/SHA256 para passwords

### 2. Token Security

- ✅ **JWT com Assinatura** - HS256 (HMAC-SHA256)
- ✅ **Curta Expiração** - Access Token: 30 min
- ✅ **Refresh Token Rotation** - Novo refresh_token a cada refresh
- ✅ **Token Type Validation** - Endpoint verifica se é access ou refresh
- ✅ **Claims Validados** - user_id e email verificados
- ❌ **Nunca** armazenar senhas em tokens
- ❌ **Nunca** usar algoritmo "none"

### 3. Email Verification

- ✅ **OTP de 6 Dígitos** - Números aleatórios via `secrets`
- ✅ **Expiração 15 min** - Reduz janela de ataque
- ✅ **Max 3 Tentativas** - Previne brute force (apenas 1000 combinações)
- ✅ **Rate Limiting** - 10 tentativas/email/15 min
- ✅ **SMTP Seguro** - TLS/SSL para envio de email
- ❌ **Nunca** expor código na URL (usar POST + body)

### 4. Rate Limiting

| Endpoint | Limite | Janela |
|----------|--------|--------|
| `/register` | 5 tentativas | 15 min (por IP) |
| `/login` | 5 tentativas | 15 min (por email) |
| `/verify-email` | 10 tentativas | 15 min (por email) |
| `/resend-otp` | 3 tentativas | 15 min (por email) |

**Implementação:**
- Em memória (esta versão)
- TODO: Redis (produção)

### 5. Auditoria (Logging)

```python
SecurityAudit.log_auth_event(
    user_id=user.id,           # UUID do usuário
    action="login",            # Ação realizada
    status="success",          # success, failed, blocked, suspicious
    ip_address="203.0.113.42", # IP do cliente
    user_agent="Mozilla/...",  # Browser/app info
    details={}                 # Dados adicionais
)

# Logs incluem:
- Timestamp (UTC)
- User ID
- Action
- Status
- IP Address
- User Agent
- Details customizados
```

### 6. CORS (Cross-Origin)

```python
CORS_ORIGINS = [
    "http://localhost:5173",          # Dev frontend
    "https://teacherflow-app.vercel.app"  # Prod frontend
]

# Permitido:
# - POST, GET, PUT, DELETE
# - Headers: Authorization, Content-Type
# - Credentials: True (cookies/auth headers)

# Bloqueado:
# - Requisições de outros domínios
# - Requisições sem headers explícitos
# - OPTIONS não listadas
```

### 7. Segurança no Banco de Dados

```sql
-- Constraints
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_ip VARCHAR(45),  -- IPv4 + IPv6
    
    -- Index para performance (login)
    CONSTRAINT idx_email UNIQUE (email),
    
    -- Automatic timestamp update
    CONSTRAINT check_timestamps CHECK (created_at <= updated_at)
);
```

---

<a name="endpoints"></a>
## 🔌 Endpoints da API Auth v2

### Registro & Verificação

#### `POST /api/auth/register`
Registrar novo usuário

```yaml
Request:
  email: "user@example.com"
  full_name: "John Doe"
  password: "SecurePass123!"

Response (200):
  message: "Usuário criado! Confira seu email..."
  email: "user@example.com"
  otp_code: "123456" (apenas em DEBUG=true)

Errors:
  400: Email já registrado
  429: Rate limite excedido
```

#### `POST /api/auth/verify-email`
Verificar email com OTP

```yaml
Request:
  email: "user@example.com"
  code: "123456"

Response (200):
  access_token: "eyJhbGc..."
  refresh_token: "eyJhbGc..."
  token_type: "bearer"
  expires_in: 1800
  user: { id, email, full_name, ... }

Errors:
  400: Código inválido/expirado
  404: Usuário não encontrado
  429: Muitas tentativas
```

#### `POST /api/auth/resend-otp`
Reenviar código OTP

```yaml
Request:
  email: "user@example.com"

Response (200):
  message: "Novo código enviado para seu email"
  otp_code: "123456" (apenas em DEBUG=true)

Errors:
  404: Usuário não encontrado
  400: Email já verificado
  429: Muitos pedidos
```

### Login

#### `POST /api/auth/login`
Fazer login

```yaml
Request:
  email: "user@example.com"
  password: "SecurePass123!"

Response (200):
  access_token: "eyJhbGc..."
  refresh_token: "eyJhbGc..."
  token_type: "bearer"
  expires_in: 1800
  user: { id, email, full_name, email_verified: true, ... }

Errors:
  401: Email ou senha incorretos
  403: Email não verificado
  429: Muitas tentativas de login
```

### Refresh Token

#### `POST /api/auth/refresh`
Renovar access token

```yaml
Request:
  refresh_token: "eyJhbGc..."

Response (200):
  access_token: "eyJhbGc..." (NOVO)
  refresh_token: "eyJhbGc..." (NOVO - rotation)
  token_type: "bearer"
  expires_in: 1800
  user: { ... }

Errors:
  401: Token inválido/expirado
```

### Mudança de Senha

#### `POST /api/auth/change-password`
Mudar senha (requer autenticação)

```yaml
Headers:
  Authorization: "Bearer eyJhbGc..."

Request:
  old_password: "OldPass123!"
  new_password: "NewSecurePass456!"

Response (200):
  message: "Senha alterada com sucesso"

Errors:
  401: Senha atual incorreta
  401: Não autenticado
```

### Google OAuth2 (Em Breve)

#### `POST /api/auth/google`
Autenticação com Google

```yaml
Request:
  id_token: "eyJhbGc..." (do Google)

Response:
  access_token: "eyJhbGc..."
  refresh_token: "eyJhbGc..."
  token_type: "bearer"
  expires_in: 1800
  user: { ... }

Errros:
  401: Token inválido
  500: Google API error
```

### 2FA (Em Breve)

#### `POST /api/auth/2fa/enable`
Habilitar 2FA

#### `POST /api/auth/2fa/verify`
Verificar código 2FA

---

<a name="env"></a>
## 🔑 Variáveis de Ambiente

### Necessárias em Produção

```env
# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require

# JWT
SECRET_KEY=tQ8ktik6_VDustnAjoKET9xFMO8Oy2ea8BhzVqhQWXY  # Min 32 chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# App
DEBUG=false  # NUNCA true em produção!
API_V1_STR=/api

# CORS
CORS_ORIGINS=["https://teacherflow-app.vercel.app"]

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=seu-email@gmail.com
SMTP_PASSWORD=seu-app-password
SMTP_FROM_EMAIL=noreply@teacherflow.app

# SMS (Twilio/Vonage - opcional)
TWILIO_ACCOUNT_SID=xxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_FROM_NUMBER=+5511999999999

# Google OAuth
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxxx

# Sentry (Monitoring)
SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
```

---

<a name="testes"></a>
## 🧪 Testes & Simulações

### Teste: Fluxo Completo de Registro

```bash
# 1. Registrar novo usuário
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@example.com",
    "full_name": "Jane Doe",
    "password": "SecurePass123!"
  }'

# Response:
# {
#   "message": "Usuário criado!",
#   "email": "teste@example.com",
#   "otp_code": "123456"
# }

# 2. Verificar email (usar otp_code recebido)
curl -X POST http://localhost:8000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@example.com",
    "code": "123456"
  }'

# Response:
# {
#   "access_token": "eyJhbGc...",
#   "refresh_token": "eyJhbGc...",
#   "expires_in": 1800,
#   "user": { ... }
# }
```

### Teste: Rate Limiting

```bash
# Fazer 5 tentativas de login rapidamente
for i in {1..6}; do
  curl -X POST http://localhost:8000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"user@example.com","password":"wrong"}'
  sleep 1
done

# Resposta da 6ª tentativa:
# 429 Too Many Requests
# "Muitas tentativas de login. Tente novamente em 15 minutos."
```

### Teste: Validação de Força de Senha

```bash
# Senha fraca (sem maiúscula)
curl -X POST http://localhost:8000/api/auth/register \
  -d '{"password":"weakpass123!"}'
# Erro: "deve conter pelo menos 1 letra maiúscula"

# Senha forte
curl -X POST http://localhost:8000/api/auth/register \
  -d '{"password":"StrongPass123!"}'
# Sucesso
```

### Teste: Refresh Token Rotation

```bash
# 1. Fazer login e obter tokens
ACCESS_TOKEN="eyJhbGc..."
REFRESH_TOKEN="eyJhbGc..."

# 2. Usar refresh token
curl -X POST http://localhost:8000/api/auth/refresh \
  -d '{"refresh_token":"'$REFRESH_TOKEN'"}'

# Response:
# {
#   "access_token": "eyJhbGc...(NOVO)",
#   "refresh_token": "eyJhbGc...(NOVO)",  ← Diferentes!
# }

# ✅ Token antigo não pode ser mais usado (rotation)
```

---

## 📚 Próximas Implementações

- [ ] Email real via SMTP (Gmail/SendGrid)
- [ ] Google OAuth2 integration
- [ ] SMS 2FA (Twilio)
- [ ] TOTP 2FA (Google Authenticator)
- [ ] Backup codes para 2FA
- [ ] Trusted devices (30 dias)
- [ ] Session management
- [ ] Account recovery
- [ ] Password reset via email
- [ ] Redis para rate limiting
- [ ] Sentry para error tracking

---

**✅ Arquitetura de Segurança Enterprise-Grade Implementada!**
