# Sistema de Notificações - BMB ESTÉTICA AUTOMOTIVA

## 📱 Notificações Implementadas

O sistema envia notificações automáticas quando um novo agendamento é criado:

### 1. Para o Dono (Você)
- **WhatsApp**: +5521992739496 (preparado para Twilio - aguardando credenciais)
- **Email**: Quando configurado

### 2. Para o Cliente
- **Email**: Confirmação do agendamento
- **WhatsApp**: Confirmação (preparado para Twilio - aguardando credenciais)

## 🔧 Configuração

### Opção 1: Email Temporário (Recomendado para Início)

Edite o arquivo `/app/backend/.env` e adicione:

```env
OWNER_EMAIL="seu_email@gmail.com"
SMTP_USER="seu_email@gmail.com"
SMTP_PASSWORD="sua_senha_de_app"
FROM_EMAIL="seu_email@gmail.com"
```

**Como obter senha de app do Gmail:**
1. Acesse: https://myaccount.google.com/security
2. Ative "Verificação em duas etapas"
3. Vá em "Senhas de app"
4. Gere uma senha para "Email"
5. Use essa senha no `SMTP_PASSWORD`

### Opção 2: WhatsApp via Twilio (Futuro)

Quando tiver as credenciais do Twilio:

```env
TWILIO_ACCOUNT_SID="seu_account_sid"
TWILIO_AUTH_TOKEN="seu_auth_token"
TWILIO_WHATSAPP_NUMBER="whatsapp:+14155238886"
```

O código já está preparado para adicionar essa funcionalidade!

## 📧 Conteúdo das Notificações

### Email para o Dono:
- Título do serviço
- Data e horário
- Dados completos do cliente (nome, telefone, email)
- Dados do veículo (modelo e placa)
- ID do agendamento

### Email para o Cliente:
- Confirmação do agendamento
- Detalhes do serviço
- Localização: RUA JUIZ JACOB GOLDEMBERG, 4
- Instruções para chegada
- ID do agendamento

## 🚀 Como Ativar

1. Configure o email no arquivo `.env`
2. Reinicie o backend:
   ```bash
   sudo supervisorctl restart backend
   ```
3. Faça um teste criando um novo agendamento

## 📝 Notas

- As notificações são enviadas em segundo plano (não bloqueiam a criação do agendamento)
- Se o email não estiver configurado, o sistema funciona normalmente sem enviar notificações
- Os logs de notificações podem ser vistos em: `/var/log/supervisor/backend.err.log`

## 🔮 Próximos Passos

1. **Imediato**: Configure o email temporário
2. **Futuro**: Obtenha credenciais do Twilio para WhatsApp
3. **Opcional**: Adicione notificações para mudanças de status (confirmado, concluído)
