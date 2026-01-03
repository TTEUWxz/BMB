import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { ArrowLeft, Calendar, Clock, Car, User, Filter, CheckCircle, XCircle, Circle, Bell } from 'lucide-react';
import { motion } from 'framer-motion';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  const fetchBookings = async () => {
    try {
      const url = filter === 'all' ? `${API}/bookings` : `${API}/bookings?status=${filter}`;
      const response = await axios.get(url);
      setBookings(response.data);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
      toast.error('Erro ao carregar agendamentos');
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      await axios.patch(`${API}/bookings/${bookingId}`, { status: newStatus });
      toast.success('Status atualizado com sucesso!');
      fetchBookings();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      pending: 'status-badge status-pending',
      confirmed: 'status-badge status-confirmed',
      completed: 'status-badge status-completed',
      cancelled: 'status-badge status-cancelled'
    };
    return classes[status] || 'status-badge';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pendente',
      confirmed: 'Confirmado',
      completed: 'Concluído',
      cancelled: 'Cancelado'
    };
    return labels[status] || status;
  };

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length
  };

  return (
    <div className="min-h-screen px-6 py-12" style={{ background: '#09090b' }}>
      <div className="noise-overlay"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <button
          onClick={() => navigate('/')}
          data-testid="back-button"
          className="flex items-center gap-2 mb-8 px-4 py-2 rounded-full"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#f4f4f5',
            transition: 'all 0.3s ease'
          }}
        >
          <ArrowLeft size={20} />
          Voltar
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#f4f4f5' }}>Painel Administrativo</h1>
          <div className="flex items-center justify-between">
            <p style={{ color: '#a1a1aa' }}>Gerencie todos os agendamentos</p>
            <button
              onClick={() => navigate('/admin/notificacoes')}
              data-testid="notification-setup-button"
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
              style={{
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                color: '#3b82f6'
              }}
            >
              <Bell size={16} />
              Configurar Notificações
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', value: stats.total, color: '#3b82f6' },
            { label: 'Pendentes', value: stats.pending, color: '#eab308' },
            { label: 'Confirmados', value: stats.confirmed, color: '#22c55e' },
            { label: 'Concluídos', value: stats.completed, color: '#3b82f6' }
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-6 rounded-xl"
              style={{ background: 'rgba(24, 24, 27, 0.5)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
            >
              <p className="text-sm mb-2" style={{ color: '#a1a1aa' }}>{stat.label}</p>
              <p className="text-3xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
            </motion.div>
          ))}
        </div>

        <div className="glass-card rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Filter size={20} style={{ color: '#3b82f6' }} />
            <h3 className="font-semibold" style={{ color: '#f4f4f5' }}>Filtrar por Status</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {[
              { value: 'all', label: 'Todos' },
              { value: 'pending', label: 'Pendentes' },
              { value: 'confirmed', label: 'Confirmados' },
              { value: 'completed', label: 'Concluídos' },
              { value: 'cancelled', label: 'Cancelados' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                data-testid={`filter-${option.value}`}
                className="px-6 py-2 rounded-full font-medium text-sm"
                style={{
                  background: filter === option.value ? '#3b82f6' : 'rgba(255, 255, 255, 0.05)',
                  border: `1px solid ${filter === option.value ? '#3b82f6' : 'rgba(255, 255, 255, 0.1)'}`,
                  color: '#f4f4f5'
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#3b82f6' }}></div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <Calendar size={64} style={{ color: '#52525b', margin: '0 auto 16px' }} />
            <p className="text-lg" style={{ color: '#a1a1aa' }}>Nenhum agendamento encontrado</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking, idx) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="glass-card rounded-xl overflow-hidden"
                data-testid={`booking-item-${booking.id}`}
              >
                <div
                  className="p-6 cursor-pointer"
                  onClick={() => setExpandedId(expandedId === booking.id ? null : booking.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h4 className="text-lg font-semibold" style={{ color: '#f4f4f5' }}>
                          {booking.customer_name}
                        </h4>
                        <span className={getStatusBadgeClass(booking.status)}>
                          {getStatusLabel(booking.status)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} style={{ color: '#3b82f6' }} />
                          <span style={{ color: '#a1a1aa' }}>
                            {new Date(booking.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={16} style={{ color: '#3b82f6' }} />
                          <span style={{ color: '#a1a1aa' }}>{booking.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Car size={16} style={{ color: '#3b82f6' }} />
                          <span style={{ color: '#a1a1aa' }}>{booking.vehicle_model}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User size={16} style={{ color: '#3b82f6' }} />
                          <span style={{ color: '#a1a1aa' }}>{booking.service_name}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-sm" style={{ color: '#71717a' }}>
                      {expandedId === booking.id ? '▲' : '▼'}
                    </div>
                  </div>
                </div>

                {expandedId === booking.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-6 pb-6"
                    style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}
                  >
                    <div className="pt-6 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p style={{ color: '#a1a1aa' }}>Telefone</p>
                          <p className="font-medium" style={{ color: '#f4f4f5' }}>{booking.customer_phone}</p>
                        </div>
                        <div>
                          <p style={{ color: '#a1a1aa' }}>Email</p>
                          <p className="font-medium" style={{ color: '#f4f4f5' }}>{booking.customer_email}</p>
                        </div>
                        <div>
                          <p style={{ color: '#a1a1aa' }}>Placa</p>
                          <p className="font-medium" style={{ color: '#f4f4f5' }}>{booking.vehicle_plate}</p>
                        </div>
                        <div>
                          <p style={{ color: '#a1a1aa' }}>ID</p>
                          <p className="font-medium text-xs" style={{ color: '#71717a' }}>{booking.id}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 pt-4">
                        {booking.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                              data-testid={`confirm-button-${booking.id}`}
                              className="flex items-center gap-2 px-6 py-2 rounded-full font-medium text-sm"
                              style={{ background: '#22c55e', color: '#ffffff' }}
                            >
                              <CheckCircle size={16} />
                              Confirmar
                            </button>
                            <button
                              onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                              data-testid={`cancel-button-${booking.id}`}
                              className="flex items-center gap-2 px-6 py-2 rounded-full font-medium text-sm"
                              style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#ef4444' }}
                            >
                              <XCircle size={16} />
                              Cancelar
                            </button>
                          </>
                        )}
                        {booking.status === 'confirmed' && (
                          <button
                            onClick={() => updateBookingStatus(booking.id, 'completed')}
                            data-testid={`complete-button-${booking.id}`}
                            className="flex items-center gap-2 px-6 py-2 rounded-full font-medium text-sm"
                            style={{ background: '#3b82f6', color: '#ffffff' }}
                          >
                            <CheckCircle size={16} />
                            Marcar como Concluído
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
