import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, MessageCircle, CheckCircle, AlertCircle, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const NotificationSetup = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    owner_email: '',
    owner_whatsapp: '+5521992739496',
    smtp_user: '',
    smtp_password: '',
    smtp_server: 'smtp.gmail.com',
    smtp_port: '587'
  });
  const [currentConfig, setCurrentConfig] = useState(null);

  useEffect(() => {
    fetchCurrentConfig();
  }, []);

  const fetchCurrentConfig = async () => {
    try {
      const response = await axios.get(`${API}/notification-config`);
      setCurrentConfig(response.data);
      if (response.data.owner_email) {
        setConfig(prev => ({
          ...prev,
          owner_email: response.data.owner_email,
          smtp_user: response.data.smtp_user || ''
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await axios.post(`${API}/notification-config`, config);
      toast.success('Configurações salvas! Reiniciando backend...');
      
      setTimeout(async () => {
        await fetchCurrentConfig();
        toast.success('Backend reiniciado! Notificações ativadas.');
      }, 3000);
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen px-6 py-12" style={{ background: '#09090b' }}>
      <div className="noise-overlay"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        <button
          onClick={() => navigate('/admin')}
          className="flex items-center gap-2 mb-8 px-4 py-2 rounded-full"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#f4f4f5'
          }}
        >
          <ArrowLeft size={20} />
          Voltar
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-8 md:p-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <MessageCircle size={32} style={{ color: '#3b82f6' }} />
            <h1 className="text-3xl font-bold" style={{ color: '#f4f4f5' }}>
              Sistema de Notificações
            </h1>
          </div>

          <p className="mb-8" style={{ color: '#a1a1aa' }}>
            Configure as notificações automáticas para receber alertas de novos agendamentos.
          </p>

          {/* Status atual */}
          <div className="mb-8 p-6 rounded-xl" style={{ 
            background: currentConfig?.email_configured ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)', 
            border: currentConfig?.email_configured ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(234, 179, 8, 0.3)' 
          }}>
            <div className="flex items-center gap-3 mb-4">
              {currentConfig?.email_configured ? (
                <CheckCircle size={24} style={{ color: '#22c55e' }} />
              ) : (
                <AlertCircle size={24} style={{ color: '#eab308' }} />
              )}
              <h3 className="text-lg font-semibold" style={{ color: '#f4f4f5' }}>Status Atual</h3>
            </div>
            <div className="space-y-2 text-sm" style={{ color: '#a1a1aa' }}>
              <p>📱 <strong>WhatsApp:</strong> Preparado (+5521992739496)</p>
              <p>📧 <strong>Email:</strong> {currentConfig?.email_configured ? `✓ Configurado (${currentConfig.owner_email})` : 'Configure abaixo para ativar'}</p>
            </div>
          </div>

          {/* Formulário de Configuração */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4" style={{ color: '#f4f4f5' }}>
              ⚙️ Configurar Notificações por Email
            </h3>
            
            <form onSubmit={handleSave} className="space-y-6">
              <div className="p-6 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <div className="space-y-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium" style={{ color: '#f4f4f5' }}>
                      Seu Email (para receber notificações)
                    </label>
                    <input
                      type="email"
                      value={config.owner_email}
                      onChange={(e) => setConfig({...config, owner_email: e.target.value})}
                      placeholder="seu_email@gmail.com"
                      required
                      className="w-full h-12 px-4 rounded-lg"
                      style={{
                        background: 'rgba(0, 0, 0, 0.2)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#f4f4f5'
                      }}
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium" style={{ color: '#f4f4f5' }}>
                      Email SMTP (geralmente o mesmo)
                    </label>
                    <input
                      type="email"
                      value={config.smtp_user}
                      onChange={(e) => setConfig({...config, smtp_user: e.target.value})}
                      placeholder="seu_email@gmail.com"
                      required
                      className="w-full h-12 px-4 rounded-lg"
                      style={{
                        background: 'rgba(0, 0, 0, 0.2)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#f4f4f5'
                      }}
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium" style={{ color: '#f4f4f5' }}>
                      Senha de App do Gmail
                      <a 
                        href="https://myaccount.google.com/apppasswords" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="ml-2 text-xs"
                        style={{ color: '#3b82f6' }}
                      >
                        (Como gerar →)
                      </a>
                    </label>
                    <input
                      type="password"
                      value={config.smtp_password}
                      onChange={(e) => setConfig({...config, smtp_password: e.target.value})}
                      placeholder="Digite a senha de app (16 caracteres)"
                      required
                      className="w-full h-12 px-4 rounded-lg"
                      style={{
                        background: 'rgba(0, 0, 0, 0.2)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#f4f4f5'
                      }}
                    />
                    <p className="text-xs mt-2" style={{ color: '#71717a' }}>
                      Gere uma "Senha de app" nas configurações de segurança do Gmail
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  data-testid="save-notification-config"
                  className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium"
                  style={{
                    background: saving ? '#52525b' : '#3b82f6',
                    color: '#ffffff',
                    cursor: saving ? 'not-allowed' : 'pointer'
                  }}
                >
                  <Save size={20} />
                  {saving ? 'Salvando...' : 'Salvar Configurações'}
                </button>
              </div>
            </form>
          </div>

          {/* Info adicional */}
          <div className="p-6 rounded-xl" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
            <h4 className="font-semibold mb-3" style={{ color: '#f4f4f5' }}>📋 O que será enviado?</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm" style={{ color: '#a1a1aa' }}>
              <div>
                <p className="font-medium mb-2" style={{ color: '#f4f4f5' }}>Para você:</p>
                <ul className="space-y-1">
                  <li>• Dados completos do cliente</li>
                  <li>• Serviço e horário</li>
                  <li>• Informações do veículo</li>
                </ul>
              </div>
              <div>
                <p className="font-medium mb-2" style={{ color: '#f4f4f5' }}>Para o cliente:</p>
                <ul className="space-y-1">
                  <li>• Confirmação do agendamento</li>
                  <li>• Detalhes do serviço</li>
                  <li>• Localização da estética</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotificationSetup;
