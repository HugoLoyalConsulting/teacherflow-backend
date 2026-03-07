# 🎉 TeacherFlow - Guia de Acesso para Usuários

**Status:** ✅ **PRONTO PARA USAR AGORA**

---

## 🚀 Comece Aqui (3 passos simples)

### 1️⃣ **Abra o App**
Clique neste link ou cole no navegador:

**👉 https://frontend-production-a7c5.up.railway.app**

### 2️⃣ **Registre-se**
- Clique em "Registrar" ou "Sign Up"
- Preencha:
  - **Email:** seu@email.com
  - **Senha:** mínimo 8 caracteres
  - **Nome:** Seu nome completo
- Clique em "Registrar"

### 3️⃣ **Confirme seu Email**
- Verifique sua caixa de entrada
- Clique no link "Confirmar Email"
- Pronto! Já pode fazer login

---

## 📱 Requisitos Mínimos

✅ **Navegador web moderno**
- Chrome, Firefox, Safari ou Edge (versão recente)
- Não precisa de app para mobile (ainda)

✅ **Conexão com internet**
- HTTPS (criptografado, seguro)
- Funcionam em 4G/WiFi

✅ **Email válido**
- Para criar conta
- Para receber link de confirmação

---

## 🎯 O que você consegue fazer AGORA

### ✅ **Criar e Gerenciar Alunos**
- Adicionar alunos com nome, email, profissão
- Ver lista de todos os seus alunos
- Atualizar dados do aluno
- Deletar aluno (com confirmação)

### ✅ **Organizar em Turmas**
- Criar grupos/turmas (ex: "Iniciantes de Google Sheets")
- Adicionar alunos em uma turma
- Ver todos os alunos de uma turma
- Remover aluno de turma

### ✅ **Gerenciar Locais**
- Criar locais onde dá aula (online, meu escritório, etc.)
- Selecionar local ao criar aula

### ✅ **Registrar Aulas**
- Criar aula com: data, hora, local, alunos
- Ver calendário de aulas
- Listar todas as suas aulas

### ✅ **Acompanhar Pagamentos**
- Registrar pagamentos dos alunos
- Ver quem pagou e quem não pagou
- Histórico de pagamentos por aluno

### ✅ **Dashboard com Métricas**
- Quantos alunos tem
- Quantos pagamentos recebeu este mês
- Quantas aulas deu
- Receita total

### ✅ **Dar Feedback**
- Botão flutuante de feedback no canto inferior direito
- Diga a gente o que melhorar!
- Seu feedback nos ajuda a ser melhores

---

## ❌ O que NÃO está pronto ainda

🔜 **Integração com Stripe (pagamentos reais)**
- Você consegue registrar manualmente
- Integração com Stripe vem depois

🔜 **Agendamento automático**
- Marque aulas manualmente por enquanto
- Automação vem depois

🔜 **Google Calendar Sync**
- Sincronizar com seu Google Calendar
- Fila para próximo mês

🔜 **App Mobile**
- Usar no celular por enquanto via navegador
- App nativo vem cando tiver demanda

---

## 🔒 Seus Dados Estão Seguros

✅ **Criptografia HTTPS**
- Comunicação entre seu navegador ↔ servidor é criptografada
- Ninguém consegue ver seus dados em trânsito

✅ **Banco de Dados Seguro**
- Dados armazenados em PostgreSQL (Azure)
- Backups automáticos diários
- Criptografia em repouso

✅ **Senha Segura**
- Usando bcrypt (hashing de 1 sentido)
- Se alguém hacker conseguir entrar, não consegue ler suas senhas
- Nem nós conseguimos ver sua senha original

✅ **Tokens JWT**
- Login usa JWT token (como cartão de identificação)
- Token expira em 30 minutos
- Você "reautentica" automaticamente

---

## 🆘 Troubleshooting

### ❌ **"Email não chega"**
**Solução:**
1. Aguarde 5 minutos (email pode ser lento)
2. Cheque pasta "Spam" ou "Promoções"
3. Se ainda não chegou, tente registrar novamente com outro email
4. Se problema persiste, envie feedback (botão no app)

### ❌ **"Esqueci minha senha"**
**Solução:**
1. Clique em "Esqueci minha senha?" na tela de login
2. Coloque seu email
3. Clique no link que receber
4. Crie uma nova senha
5. Faça login novamente

### ❌ **"App conectando ao servidor..."**
**Solução:**
1. Espere 30 segundos (servidor pode estar iniciando)
2. Atualize a página (F5 ou ⌘R)
3. Tente em outro navegador
4. Verifique sua conexão de internet
5. Se não funcionar, diga no feedback (pode ser problema nosso)

### ❌ **"CORS error" ou "fetch error"**
**Solução (para o desenvolvedor):**
- Erro raro, significa backend não responde
- Tente: Esperar 1 min + atualizar página
- Se persiste: Report via feedback

### ❌ **"401 Unauthorized"**
**Solução:**
1. Você foi desconectado (sessão expirou)
2. Faça login novamente
3. Seu token de 30 minutos expirou? Normal!

---

## 💡 Dicas & Truques

### 🔐 **Senha Forte**
```
❌ 12345678
❌ senha
❌ 123456789
✅ MeuAno1990SenhaForte
✅ GSheet@Aula#2026
✅ D0gGato@Casa
```

### 📧 **Email para Recuperação**
Use um email que você sempre tem acesso. Se perder acesso a ele, perderá acesso à conta.

### 💾 **Dados Salvam Automaticamente**
- Ao criar aluno: salva imediatamente
- Não precisa de botão "Salvar"
- Se tiver dúvida, veja se apareceu na lista

### 📊 **Dashboard se Atualiza em Tempo Real**
- Criar aluno → dashboard aumenta
- Registrar pagamento → gráfico atualiza
- Você não precisa atualizar a página

### ⌨️ **Atalhos**
(Ainda não implementados, mas virão)
- /dashboard (ir para dashboard)
- /students (ir para alunos)
- etc.

---

## 📝 Feedback Importante

### Viu um bug?
Clique no botão de **feedback** (canto inferior direito do app) e descreva:
- O que você estava fazendo
- O que esperava que acontecesse
- O que aconteceu na verdade
- Se possível, print de tela

**Seu feedback é OURO** 🏆 nos ajuda muito!

### Tem sugestão de nova feature?
Também use o botão de feedback! Descreva:
- O que gostaria que existisse
- Por que precisaria disso
- Como deveria funcionar (ideias)

---

## 🆘 Precisa de Ajuda?

### 📬 **Email**
Envie para: [seu email aqui]

### 💬 **Feedback Button**
Clique no botão flutuante no app (canto inferior direito)

### 🐛 **Reportar Bug**
Descreva exatamente o que deu errado + print se possível

---

## 🎓 Próximos Passos

### Semana 1
- [ ] Registrar e confirmar email
- [ ] Criar 3+ alunos
- [ ] Criar 1 turma
- [ ] Adicionar alunos na turma
- [ ] Criar 2+ aulas

### Semana 2
- [ ] Registrar alguns pagamentos
- [ ] Conferir dashboard
- [ ] Ver calendário de aulas
- [ ] Dar feedback (bom ou ruim!)

### Semana 3+
- [ ] Sugestões baseadas em seu uso
- [ ] Novos features baseados em feedback

---

## 🚀 Links Rápidos

| O que | Link |
|------|------|
| 🌐 **Acessar App** | https://frontend-production-a7c5.up.railway.app |
| 📖 **API Docs** | https://backend-production-c4f8f.up.railway.app/docs |
| 💬 **Feedback** | Botão no app (canto inferior direito) |
| 📧 **Email** | seu@email.com |

---

## ✅ Checklist: Primeiro Acesso

- [ ] Abrí o link do app no navegador
- [ ] Consegui carregar a página (não é branco em branco)
- [ ] Cliquei em "Registrar"
- [ ] Preenchí email e senha
- [ ] Recebi email de confirmação (cheque spam)
- [ ] Cliquei no link de confirmação
- [ ] Conseguir fazer login
- [ ] Conseguir adicionar um aluno
- [ ] Conseguir criar uma turma
- [ ] Dashboard mostra meu aluno

Se tudo deu ✅, você está pronto para usar TeacherFlow!

---

## 🎉 Bem-vindo!

Obrigado por ter de beta tester do TeacherFlow! 🙌

Seus feedback vai nos ajudar a fazer o melhor app de gestão de aulas do mercado.

**Divirta-se explorando! 🚀**

---

**Última Atualização:** 7 de Março, 2026  
**Próxima Atualização:** Quando temos feedback dos usuários
