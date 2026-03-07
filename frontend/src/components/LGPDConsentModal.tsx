import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/UI/dialog';
import { Button } from '@/components/UI/button';
import { Checkbox } from '@/components/UI/checkbox';
import { ScrollArea } from '@/components/UI/scroll-area';
import { Alert, AlertDescription } from '@/components/UI/alert';
import { Shield, Lock, FileText, Eye, Trash2, Download, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';

interface LGPDModalProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  onConsentGiven?: () => void;
  isFirstLogin?: boolean;
}

interface LGPDConsentStatus {
  has_consent: boolean;
  consent_date: string | null;
  consent_version: string | null;
  data_retention_until: string | null;
}

const CURRENT_TERMS_VERSION = "1.0";

export function LGPDConsentModal({ 
  open, 
  onOpenChange, 
  onConsentGiven,
  isFirstLogin = false 
}: LGPDModalProps) {
  const { token } = useAuth();
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consentStatus, setConsentStatus] = useState<LGPDConsentStatus | null>(null);

  // Fetch current consent status
  useEffect(() => {
    if (open && token) {
      fetchConsentStatus();
    }
  }, [open, token]);

  const fetchConsentStatus = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/lgpd/consent-status`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setConsentStatus(response.data);
    } catch (err) {
      console.error('Error fetching consent status:', err);
    }
  };

  const handleAcceptConsent = async () => {
    if (!acceptTerms || !acceptPrivacy) {
      setError('Você deve aceitar os Termos de Uso e a Política de Privacidade para continuar.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/lgpd/consent`,
        {
          consent_version: CURRENT_TERMS_VERSION,
          accepts_terms: true
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (onConsentGiven) {
        onConsentGiven();
      }

      if (onOpenChange) {
        onOpenChange(false);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.detail || 
        'Erro ao registrar consentimento. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const canClose = !isFirstLogin;

  return (
    <Dialog open={open} onOpenChange={canClose ? onOpenChange : undefined}>
      <DialogContent 
        className="max-w-2xl max-h-[90vh]"
        onInteractOutside={(e) => {
          if (!canClose) e.preventDefault();
        }}
      >
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <DialogTitle className="text-2xl">
              Proteção de Dados - LGPD
            </DialogTitle>
          </div>
          <DialogDescription>
            Lei Geral de Proteção de Dados (Lei nº 13.709/2018)
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-6">
            {/* Introduction */}
            <Alert>
              <Lock className="h-4 w-4" />
              <AlertDescription>
                Valorizamos sua privacidade e estamos comprometidos com a proteção dos seus dados pessoais.
                Este documento explica como coletamos, usamos e protegemos suas informações.
              </AlertDescription>
            </Alert>

            {/* Data Collection */}
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Dados Coletados
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li><strong>Dados Pessoais:</strong> Nome, e-mail, telefone, profissão</li>
                <li><strong>Dados de Alunos:</strong> Nome, e-mail, telefone, status de pagamento</li>
                <li><strong>Dados de Uso:</strong> Logs de acesso, preferências, configurações</li>
                <li><strong>Dados de Pagamento:</strong> Histórico de transações (não armazenamos dados de cartão)</li>
              </ul>
            </div>

            {/* Purpose */}
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Finalidade
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li>Prestação de serviços educacionais</li>
                <li>Gestão de alunos, aulas e pagamentos</li>
                <li>Comunicação sobre aulas e cobranças</li>
                <li>Melhorias no sistema e suporte técnico</li>
              </ul>
            </div>

            {/* Data Retention */}
            <div className="space-y-2">
              <h3 className="font-semibold">⏱️ Retenção de Dados</h3>
              <p className="text-sm text-gray-600">
                Seus dados serão mantidos por <strong>5 anos</strong> após o último acesso, 
                conforme permitido pela LGPD (Art. 15 e 16). Após esse período, os dados 
                serão automaticamente excluídos.
              </p>
            </div>

            {/* Your Rights */}
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Seus Direitos (LGPD Art. 18)
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li><strong>Confirmação:</strong> Saber se tratamos seus dados</li>
                <li><strong>Acesso:</strong> Solicitar cópia de todos os seus dados</li>
                <li><strong>Correção:</strong> Atualizar dados incompletos ou incorretos</li>
                <li><strong>Portabilidade:</strong> Exportar seus dados em formato JSON</li>
                <li><strong>Exclusão:</strong> Solicitar exclusão permanente da conta</li>
                <li><strong>Revogação:</strong> Retirar consentimento a qualquer momento</li>
              </ul>
            </div>

            {/* Data Sharing */}
            <div className="space-y-2">
              <h3 className="font-semibold">🔒 Compartilhamento</h3>
              <p className="text-sm text-gray-600">
                Seus dados <strong>não são vendidos</strong> a terceiros. Compartilhamos apenas com:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li>Provedores de hospedagem (Render, Neon Database) - localizados nos EUA</li>
                <li>Serviços de e-mail transacional (quando aplicável)</li>
                <li>Autoridades legais (quando exigido por lei)</li>
              </ul>
            </div>

            {/* Security */}
            <div className="space-y-2">
              <h3 className="font-semibold">🛡️ Segurança</h3>
              <p className="text-sm text-gray-600">
                Implementamos medidas técnicas e organizacionais para proteger seus dados:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li>Criptografia de senhas (bcrypt)</li>
                <li>Conexões HTTPS/TLS</li>
                <li>Tokens de autenticação JWT</li>
                <li>Backup diário de dados</li>
                <li>Monitoramento de segurança contínuo</li>
              </ul>
            </div>

            {/* Contact */}
            <div className="space-y-2">
              <h3 className="font-semibold">📧 Contato DPO</h3>
              <p className="text-sm text-gray-600">
                Dúvidas sobre seus dados? Entre em contato com nosso Encarregado de Dados (DPO):
                <br />
                <strong>E-mail:</strong> dpo@teacherflow.app
                <br />
                <strong>Prazo de resposta:</strong> Até 15 dias úteis
              </p>
            </div>

            {/* Consent */}
            <div className="mt-6 space-y-4 border-t pt-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="accept-terms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                />
                <label 
                  htmlFor="accept-terms" 
                  className="text-sm leading-tight cursor-pointer"
                >
                  Li e aceito os <strong>Termos de Uso</strong> e autorizo o tratamento dos meus dados 
                  pessoais para as finalidades descritas acima.
                </label>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="accept-privacy"
                  checked={acceptPrivacy}
                  onCheckedChange={(checked) => setAcceptPrivacy(checked as boolean)}
                />
                <label 
                  htmlFor="accept-privacy" 
                  className="text-sm leading-tight cursor-pointer"
                >
                  Li e aceito a <strong>Política de Privacidade</strong> e estou ciente dos meus direitos 
                  sob a LGPD (Lei nº 13.709/2018).
                </label>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {consentStatus?.has_consent && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Consentimento registrado em {new Date(consentStatus.consent_date!).toLocaleDateString('pt-BR')}
                  {' '}(Versão {consentStatus.consent_version})
                </AlertDescription>
              </Alert>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {canClose && (
            <Button
              variant="outline"
              onClick={() => onOpenChange?.(false)}
              disabled={loading}
            >
              Fechar
            </Button>
          )}
          
          <Button
            onClick={handleAcceptConsent}
            disabled={!acceptTerms || !acceptPrivacy || loading}
            className="w-full sm:w-auto"
          >
            {loading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Processando...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                {consentStatus?.has_consent ? 'Atualizar Consentimento' : 'Aceitar e Continuar'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Hook to check LGPD consent
export function useLGPDConsent() {
  const { token, user } = useAuth();
  const [needsConsent, setNeedsConsent] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !token) {
      setLoading(false);
      return;
    }

    const checkConsent = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/v1/lgpd/consent-status`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        setNeedsConsent(!response.data.has_consent);
      } catch (err) {
        console.error('Error checking LGPD consent:', err);
        setNeedsConsent(true); // Default to showing consent if error
      } finally {
        setLoading(false);
      }
    };

    checkConsent();
  }, [user, token]);

  return { needsConsent, loading, setNeedsConsent };
}
