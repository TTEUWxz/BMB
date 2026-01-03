import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, Calendar, Clock, Car, User, Mail, Phone } from 'lucide-react';
import { motion } from 'framer-motion';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Confirmation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await axios.get(`${API}/bookings/${id}`);
        setBooking(response.data);
      } catch (error) {
        console.error('Erro ao carregar agendamento:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#09090b' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#3b82f6' }}></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#09090b' }}>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#f4f4f5' }}>Agendamento não encontrado</h2>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 rounded-full font-medium"
            style={{ background: '#3b82f6', color: '#ffffff' }}
          >
            Voltar para Início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-12" style={{ background: '#09090b' }}>
      <div className="noise-overlay"></div>

      <div className="max-w-3xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="glass-card rounded-2xl p-8 md:p-12 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
            style={{ background: 'rgba(34, 197, 94, 0.1)' }}
          >
            <CheckCircle size={48} style={{ color: '#22c55e' }} />
          </motion.div>

          <h1 className="text-3xl font-bold mb-3" style={{ color: '#f4f4f5' }}>
            Agendamento Confirmado!
          </h1>
          <p className="text-lg mb-8" style={{ color: '#a1a1aa' }}>
            Seu agendamento foi realizado com sucesso. Você receberá um email de confirmação.
          </p>

          <div className="space-y-6 text-left mb-8">
            <div className="p-6 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: '#f4f4f5' }}>
                <Calendar size={20} style={{ color: '#3b82f6' }} />
                Detalhes do Serviço
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span style={{ color: '#a1a1aa' }}>Serviço:</span>
                  <span className="font-medium" style={{ color: '#f4f4f5' }}>{booking.service_name}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#a1a1aa' }}>Data:</span>
                  <span className="font-medium" style={{ color: '#f4f4f5' }}>
                    {new Date(booking.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#a1a1aa' }}>Horário:</span>
                  <span className="font-medium" style={{ color: '#f4f4f5' }}>{booking.time}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#a1a1aa' }}>Status:</span>
                  <span className="status-badge status-pending">Pendente</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: '#f4f4f5' }}>
                <Car size={20} style={{ color: '#3b82f6' }} />
                Dados do Veículo
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span style={{ color: '#a1a1aa' }}>Modelo:</span>
                  <span className="font-medium" style={{ color: '#f4f4f5' }}>{booking.vehicle_model}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#a1a1aa' }}>Placa:</span>
                  <span className="font-medium" style={{ color: '#f4f4f5' }}>{booking.vehicle_plate}</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: '#f4f4f5' }}>
                <User size={20} style={{ color: '#3b82f6' }} />
                Seus Dados
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span style={{ color: '#a1a1aa' }}>Nome:</span>
                  <span className="font-medium" style={{ color: '#f4f4f5' }}>{booking.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#a1a1aa' }}>Telefone:</span>
                  <span className="font-medium" style={{ color: '#f4f4f5' }}>{booking.customer_phone}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#a1a1aa' }}>Email:</span>
                  <span className="font-medium" style={{ color: '#f4f4f5' }}>{booking.customer_email}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl mb-8" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
            <p className="text-sm" style={{ color: '#a1a1aa' }}>
              <strong style={{ color: '#3b82f6' }}>ID do Agendamento:</strong> {booking.id}
            </p>
          </div>

          <button
            onClick={() => navigate('/')}
            data-testid="back-to-home-button"
            className="px-8 py-3 rounded-full font-medium"
            style={{ background: '#3b82f6', color: '#ffffff' }}
          >
            Voltar para Início
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Confirmation;