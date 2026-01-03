import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { ArrowLeft, Calendar as CalendarIcon, Clock, User, Car, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const BookingForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    service_id: location.state?.selectedServiceId || '',
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    vehicle_model: '',
    vehicle_plate: '',
    date: '',
    time: ''
  });

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get(`${API}/services`);
        setServices(response.data);
      } catch (error) {
        console.error('Erro ao carregar serviços:', error);
        toast.error('Erro ao carregar serviços');
      }
    };
    fetchServices();
  }, []);

  useEffect(() => {
    if (formData.date) {
      fetchTimeSlots(formData.date);
    }
  }, [formData.date]);

  const fetchTimeSlots = async (date) => {
    try {
      const response = await axios.get(`${API}/timeslots?date=${date}`);
      setTimeSlots(response.data);
    } catch (error) {
      console.error('Erro ao carregar horários:', error);
      toast.error('Erro ao carregar horários');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Só permitir submit na etapa 3
    if (step !== 3) {
      return;
    }
    
    setLoading(true);

    try {
      const response = await axios.post(`${API}/bookings`, formData);
      toast.success('Agendamento realizado com sucesso!');
      navigate(`/confirmacao/${response.data.id}`);
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      const errorMessage = error.response?.data?.detail || 
                          (typeof error.response?.data === 'string' ? error.response.data : 'Erro ao criar agendamento');
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && !formData.service_id) {
      toast.error('Selecione um serviço');
      return;
    }
    if (step === 2 && (!formData.date || !formData.time)) {
      toast.error('Selecione data e horário');
      return;
    }
    setStep(step + 1);
  };

  const handleNextClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    nextStep();
  };

  const prevStep = () => setStep(step - 1);

  const selectedService = services.find(s => s.id === formData.service_id);

  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 60);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  return (
    <div className="min-h-screen px-6 py-12" style={{ background: '#09090b' }}>
      <div className="noise-overlay"></div>

      <div className="max-w-4xl mx-auto relative z-10">
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
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.05)';
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
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#f4f4f5' }}>Agendar Serviço</h1>
          <p className="mb-8" style={{ color: '#a1a1aa' }}>Etapa {step} de 3</p>

          <div className="flex gap-2 mb-12">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className="h-2 flex-1 rounded-full"
                style={{
                  background: s <= step ? '#3b82f6' : 'rgba(255, 255, 255, 0.1)'
                }}
              ></div>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-3" style={{ color: '#f4f4f5' }}>
                    <Sparkles size={24} style={{ color: '#3b82f6' }} />
                    Escolha o Serviço
                  </h3>
                  <div className="space-y-4">
                    {services.map((service) => (
                      <label
                        key={service.id}
                        className="flex items-start gap-4 p-6 rounded-xl cursor-pointer"
                        style={{
                          background: formData.service_id === service.id ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                          border: formData.service_id === service.id ? '2px solid #3b82f6' : '2px solid rgba(255, 255, 255, 0.1)',
                          transition: 'all 0.3s ease'
                        }}
                        data-testid={`service-option-${service.id}`}
                      >
                        <input
                          type="radio"
                          name="service"
                          value={service.id}
                          checked={formData.service_id === service.id}
                          onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
                          className="mt-1"
                          style={{ accentColor: '#3b82f6' }}
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1" style={{ color: '#f4f4f5' }}>{service.name}</h4>
                          <p className="text-sm mb-2" style={{ color: '#a1a1aa' }}>{service.description}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <span style={{ color: '#3b82f6', fontWeight: 600 }}>R$ {service.price.toFixed(2)}</span>
                            <span style={{ color: '#71717a' }}>•</span>
                            <span style={{ color: '#71717a' }}>{service.duration_minutes} min</span>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-3" style={{ color: '#f4f4f5' }}>
                    <CalendarIcon size={24} style={{ color: '#3b82f6' }} />
                    Escolha Data e Horário
                  </h3>

                  <div className="mb-8">
                    <label className="block mb-3 font-medium" style={{ color: '#f4f4f5' }}>Data</label>
                    <input
                      type="date"
                      min={today}
                      max={maxDateStr}
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value, time: '' })}
                      data-testid="date-input"
                      required
                      className="w-full h-12 px-4 rounded-lg"
                      style={{
                        background: 'rgba(0, 0, 0, 0.2)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#f4f4f5'
                      }}
                    />
                  </div>

                  {formData.date && (
                    <div>
                      <label className="block mb-3 font-medium" style={{ color: '#f4f4f5' }}>Horário</label>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {timeSlots.map((slot) => (
                          <button
                            key={slot.time}
                            type="button"
                            disabled={!slot.available}
                            onClick={() => setFormData({ ...formData, time: slot.time })}
                            data-testid={`timeslot-${slot.time}`}
                            className="py-3 px-4 rounded-lg font-medium text-sm"
                            style={{
                              background: formData.time === slot.time ? '#3b82f6' : slot.available ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                              border: formData.time === slot.time ? '1px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.1)',
                              color: slot.available ? '#f4f4f5' : '#52525b',
                              cursor: slot.available ? 'pointer' : 'not-allowed',
                              opacity: slot.available ? 1 : 0.5
                            }}
                          >
                            {slot.time}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-3" style={{ color: '#f4f4f5' }}>
                    <User size={24} style={{ color: '#3b82f6' }} />
                    Seus Dados
                  </h3>

                  <div className="space-y-6">
                    <div>
                      <label className="block mb-2 font-medium" style={{ color: '#f4f4f5' }}>Nome Completo</label>
                      <input
                        type="text"
                        value={formData.customer_name}
                        onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                        data-testid="customer-name-input"
                        required
                        className="w-full h-12 px-4 rounded-lg"
                        style={{
                          background: 'rgba(0, 0, 0, 0.2)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: '#f4f4f5'
                        }}
                        placeholder="João Silva"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block mb-2 font-medium" style={{ color: '#f4f4f5' }}>Telefone</label>
                        <input
                          type="tel"
                          value={formData.customer_phone}
                          onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                          data-testid="customer-phone-input"
                          required
                          className="w-full h-12 px-4 rounded-lg"
                          style={{
                            background: 'rgba(0, 0, 0, 0.2)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#f4f4f5'
                          }}
                          placeholder="(11) 99999-9999"
                        />
                      </div>

                      <div>
                        <label className="block mb-2 font-medium" style={{ color: '#f4f4f5' }}>Email</label>
                        <input
                          type="email"
                          value={formData.customer_email}
                          onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                          data-testid="customer-email-input"
                          required
                          className="w-full h-12 px-4 rounded-lg"
                          style={{
                            background: 'rgba(0, 0, 0, 0.2)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#f4f4f5'
                          }}
                          placeholder="joao@email.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block mb-2 font-medium" style={{ color: '#f4f4f5' }}>Modelo do Veículo</label>
                        <input
                          type="text"
                          value={formData.vehicle_model}
                          onChange={(e) => setFormData({ ...formData, vehicle_model: e.target.value })}
                          data-testid="vehicle-model-input"
                          required
                          className="w-full h-12 px-4 rounded-lg"
                          style={{
                            background: 'rgba(0, 0, 0, 0.2)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#f4f4f5'
                          }}
                          placeholder="Honda Civic 2020"
                        />
                      </div>

                      <div>
                        <label className="block mb-2 font-medium" style={{ color: '#f4f4f5' }}>Placa</label>
                        <input
                          type="text"
                          value={formData.vehicle_plate}
                          onChange={(e) => setFormData({ ...formData, vehicle_plate: e.target.value.toUpperCase() })}
                          data-testid="vehicle-plate-input"
                          required
                          className="w-full h-12 px-4 rounded-lg"
                          style={{
                            background: 'rgba(0, 0, 0, 0.2)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#f4f4f5'
                          }}
                          placeholder="ABC1D23"
                        />
                      </div>
                    </div>

                    {selectedService && (
                      <div className="mt-8 p-6 rounded-xl" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                        <h4 className="font-semibold mb-3" style={{ color: '#f4f4f5' }}>Resumo do Agendamento</h4>
                        <div className="space-y-2 text-sm" style={{ color: '#a1a1aa' }}>
                          <p><strong style={{ color: '#f4f4f5' }}>Serviço:</strong> {selectedService.name}</p>
                          <p><strong style={{ color: '#f4f4f5' }}>Data:</strong> {new Date(formData.date + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                          <p><strong style={{ color: '#f4f4f5' }}>Horário:</strong> {formData.time}</p>
                          <p><strong style={{ color: '#f4f4f5' }}>Valor:</strong> R$ {selectedService.price.toFixed(2)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-4 mt-12">
              {step > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  data-testid="prev-button"
                  className="px-8 py-3 rounded-full font-medium flex-1"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#f4f4f5'
                  }}
                >
                  Voltar
                </button>
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNextClick}
                  data-testid="next-button"
                  className="px-8 py-3 rounded-full font-medium flex-1"
                  style={{ background: '#3b82f6', color: '#ffffff' }}
                >
                  Continuar
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  data-testid="submit-button"
                  className="px-8 py-3 rounded-full font-medium flex-1"
                  style={{
                    background: loading ? '#52525b' : '#3b82f6',
                    color: '#ffffff',
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? 'Agendando...' : 'Confirmar Agendamento'}
                </button>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default BookingForm;
