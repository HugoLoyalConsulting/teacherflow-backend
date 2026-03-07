"""
Email service for sending verification codes and notifications
Uses SMTP (Gmail, etc.) configured via environment variables
"""
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional


class EmailService:
    """SMTP Email Service"""
    
    def __init__(self):
        self.smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_username = os.getenv("SMTP_USERNAME")
        self.smtp_password = os.getenv("SMTP_PASSWORD")
        self.email_from = os.getenv("EMAIL_FROM", "noreply@teacherflow.app")
        self.enabled = all([self.smtp_username, self.smtp_password])
    
    def send_email(
        self, 
        to_email: str, 
        subject: str, 
        html_body: str, 
        text_body: Optional[str] = None
    ) -> bool:
        """
        Send email via SMTP
        
        Args:
            to_email: Recipient email address
            subject: Email subject
            html_body: HTML email body
            text_body: Plain text fallback (optional)
        
        Returns:
            True if sent successfully, False otherwise
        """
        if not self.enabled:
            print("⚠️  Email service not configured (missing SMTP credentials)")
            print(f"📧 Would send to {to_email}: {subject}")
            return False
        
        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = self.email_from
            msg['To'] = to_email
            
            # Add text and HTML parts
            if text_body:
                part1 = MIMEText(text_body, 'plain')
                msg.attach(part1)
            
            part2 = MIMEText(html_body, 'html')
            msg.attach(part2)
            
            # Send via SMTP
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_username, self.smtp_password)
                server.send_message(msg)
            
            print(f"✅ Email sent to {to_email}: {subject}")
            return True
            
        except Exception as e:
            print(f"❌ Failed to send email to {to_email}: {e}")
            return False


# Singleton instance
email_service = EmailService()


def send_verification_email(email: str, code: str) -> bool:
    """
    Send 6-digit verification code via email
    
    Args:
        email: Recipient email address
        code: 6-digit verification code
    
    Returns:
        True if sent successfully
    """
    subject = "TeacherFlow - Código de Verificação"
    
    # HTML email body
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body {{
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }}
            .container {{
                background: #f9fafb;
                border-radius: 8px;
                padding: 40px;
                text-align: center;
            }}
            .code {{
                font-size: 48px;
                font-weight: bold;
                letter-spacing: 8px;
                color: #2563eb;
                background: white;
                padding: 20px;
                border-radius: 8px;
                margin: 30px 0;
                display: inline-block;
            }}
            .warning {{
                background: #fef3c7;
                border-left: 4px solid #f59e0b;
                padding: 12px;
                margin-top: 20px;
                text-align: left;
            }}
            .footer {{
                margin-top: 40px;
                font-size: 12px;
                color: #6b7280;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🔐 Verificação de Email</h1>
            <p>Use o código abaixo para verificar seu email no TeacherFlow:</p>
            
            <div class="code">{code}</div>
            
            <p>Este código expira em <strong>10 minutos</strong>.</p>
            <p>Você tem <strong>3 tentativas</strong> para inserir o código correto.</p>
            
            <div class="warning">
                <strong>⚠️ Importante:</strong> Se você não solicitou este código, ignore este email.
            </div>
            
            <div class="footer">
                <p>TeacherFlow - Sistema de Gestão de Alunos</p>
                <p>Este é um email automático, não responda.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    # Plain text fallback
    text_body = f"""
    TeacherFlow - Código de Verificação
    
    Use o código abaixo para verificar seu email:
    
    {code}
    
    Este código expira em 10 minutos.
    Você tem 3 tentativas para inserir o código correto.
    
    Se você não solicitou este código, ignore este email.
    
    ---
    TeacherFlow - Sistema de Gestão de Alunos
    Este é um email automático, não responda.
    """
    
    return email_service.send_email(email, subject, html_body, text_body)


def send_welcome_email(email: str, name: str) -> bool:
    """
    Send welcome email after successful verification
    
    Args:
        email: User email
        name: User name
    
    Returns:
        True if sent successfully
    """
    subject = "Bem-vindo ao TeacherFlow!"
    
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body {{
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }}
            .container {{
                background: #f9fafb;
                border-radius: 8px;
                padding: 40px;
            }}
            .header {{
                text-align: center;
                margin-bottom: 30px;
            }}
            .features {{
                background: white;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
            }}
            .feature-item {{
                margin: 15px 0;
                padding-left: 30px;
            }}
            .cta {{
                text-align: center;
                margin: 30px 0;
            }}
            .button {{
                display: inline-block;
                background: #2563eb;
                color: white;
                padding: 12px 24px;
                border-radius: 6px;
                text-decoration: none;
                font-weight: bold;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Bem-vindo ao TeacherFlow, {name}!</h1>
                <p>Seu email foi verificado com sucesso.</p>
            </div>
            
            <p>Você agora tem acesso completo à plataforma de gestão de alunos mais moderna do Brasil.</p>
            
            <div class="features">
                <h3>🚀 O que você pode fazer:</h3>
                <div class="feature-item">📚 Gerenciar alunos e turmas</div>
                <div class="feature-item">📅 Criar e controlar horários</div>
                <div class="feature-item">💰 Acompanhar pagamentos</div>
                <div class="feature-item">📊 Visualizar dashboard com métricas</div>
                <div class="feature-item">📍 Organizar locais de aula</div>
            </div>
            
            <div class="cta">
                <a href="https://frontend-production-a7c5.up.railway.app" class="button">
                    Começar Agora →
                </a>
            </div>
            
            <p style="margin-top: 40px; font-size: 14px; color: #6b7280;">
                Precisa de ajuda? Visite nossa <a href="https://frontend-production-a7c5.up.railway.app/help">central de ajuda</a>.
            </p>
        </div>
    </body>
    </html>
    """
    
    text_body = f"""
    Bem-vindo ao TeacherFlow, {name}!
    
    Seu email foi verificado com sucesso.
    
    Você agora tem acesso completo à plataforma de gestão de alunos.
    
    O que você pode fazer:
    - Gerenciar alunos e turmas
    - Criar e controlar horários
    - Acompanhar pagamentos
    - Visualizar dashboard com métricas
    - Organizar locais de aula
    
    Acesse: https://frontend-production-a7c5.up.railway.app
    
    Precisa de ajuda? Visite: https://frontend-production-a7c5.up.railway.app/help
    """
    
    return email_service.send_email(email, subject, html_body, text_body)


def send_password_reset_email(email: str, code: str) -> bool:
    """
    Send password reset code via email
    
    Args:
        email: User email
        code: 6-digit reset code
    
    Returns:
        True if sent successfully
    """
    subject = "TeacherFlow - Redefinição de Senha"
    
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body {{
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }}
            .container {{
                background: #f9fafb;
                border-radius: 8px;
                padding: 40px;
                text-align: center;
            }}
            .code {{
                font-size: 48px;
                font-weight: bold;
                letter-spacing: 8px;
                color: #dc2626;
                background: white;
                padding: 20px;
                border-radius: 8px;
                margin: 30px 0;
                display: inline-block;
            }}
            .warning {{
                background: #fee2e2;
                border-left: 4px solid #dc2626;
                padding: 12px;
                margin-top: 20px;
                text-align: left;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🔑 Redefinição de Senha</h1>
            <p>Use o código abaixo para redefinir sua senha:</p>
            
            <div class="code">{code}</div>
            
            <p>Este código expira em <strong>10 minutos</strong>.</p>
            
            <div class="warning">
                <strong>⚠️ Segurança:</strong> Se você não solicitou a redefinição de senha, alguém pode estar tentando acessar sua conta. Recomendamos alterar sua senha imediatamente.
            </div>
        </div>
    </body>
    </html>
    """
    
    text_body = f"""
    TeacherFlow - Redefinição de Senha
    
    Use o código abaixo para redefinir sua senha:
    
    {code}
    
    Este código expira em 10 minutos.
    
    ⚠️ Se você não solicitou a redefinição de senha, alguém pode estar tentando acessar sua conta.
    """
    
    return email_service.send_email(email, subject, html_body, text_body)
