import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, Clock, Shield, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Home = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeServices = async () => {
      try {
        await axios.post(`${API}/init-services`);
        const response = await axios.get(`${API}/services`);
        setServices(response.data);
      } catch (error) {
        console.error('Erro ao carregar serviços:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeServices();
  }, []);

  const handleBookService = (serviceId) => {
    navigate('/agendar', { state: { selectedServiceId: serviceId } });
  };

  return (
    <div className="relative min-h-screen" style={{ background: '#09090b' }}>
      <div className="noise-overlay"></div>
      <div className="hero-glow"></div>

      <div className="relative z-10">
        <header className="px-6 py-8 max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-2xl font-bold" style={{ color: '#3b82f6' }}>BMB ESTÉTICA AUTOMOTIVA</h1>
            </motion.div>
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              onClick={() => navigate('/admin')}
              data-testid="admin-link"
              className="px-6 py-2 rounded-full text-sm font-medium"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#f4f4f5',
                backdropFilter: 'blur(12px)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.05)';
              }}
            >
              Painel Admin
            </motion.button>
          </div>
        </header>

        <section className="px-6 py-20 max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6" style={{ color: '#f4f4f5' }}>
              Estética Automotiva de<br />Excelência
            </h2>
            <p className="text-base sm:text-lg max-w-2xl mx-auto mb-4" style={{ color: '#a1a1aa' }}>
              Transformamos seu veículo com cuidado profissional e produtos premium.
              Agende agora e experimente o melhor em detalhamento automotivo.
            </p>
            <div className="flex items-center justify-center gap-2 mb-10" style={{ color: '#3b82f6' }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm font-medium" style={{ color: '#a1a1aa' }}>RUA JUIZ JACOB GOLDEMBERG, 4</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto mb-16"
          >
            {[
              { icon: Calendar, label: 'Agendamento Fácil' },
              { icon: Clock, label: 'Pontualidade' },
              { icon: Shield, label: 'Garantia' },
              { icon: Sparkles, label: 'Resultado Premium' }
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-xl"
                style={{
                  background: 'rgba(24, 24, 27, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <item.icon size={32} style={{ color: '#3b82f6', margin: '0 auto 12px' }} />
                <p className="text-sm font-medium" style={{ color: '#f4f4f5' }}>{item.label}</p>
              </div>
            ))}
          </motion.div>
        </section>

        <section className="px-6 py-12 max-w-7xl mx-auto">
          <motion.h3
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl font-bold mb-12 text-center"
            style={{ color: '#f4f4f5' }}
          >
            Nossos Serviços
          </motion.h3>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#3b82f6' }}></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {services.map((service, idx) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  className="service-card rounded-2xl"
                  style={{
                    background: 'rgba(24, 24, 27, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.05)'
                  }}
                  data-testid={`service-card-${service.id}`}
                >
                  <div className="relative h-64 overflow-hidden rounded-t-2xl">
                    <img
                      src={service.image_url}
                      alt={service.name}
                      className="w-full h-full object-cover"
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        background: 'linear-gradient(to top, rgba(9, 9, 11, 0.9) 0%, transparent 50%)'
                      }}
                    ></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h4 className="text-2xl font-bold mb-1" style={{ color: '#f4f4f5' }}>{service.name}</h4>
                      <p className="text-sm" style={{ color: '#a1a1aa' }}>{service.duration_minutes} minutos</p>
                    </div>
                  </div>

                  <div className="p-6">
                    <p className="mb-6" style={{ color: '#a1a1aa', fontSize: '0.95rem' }}>
                      {service.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-3xl font-bold" style={{ color: '#f4f4f5' }}>
                          R$ {service.price.toFixed(2)}
                        </span>
                      </div>
                      <button
                        onClick={() => handleBookService(service.id)}
                        data-testid={`book-button-${service.id}`}
                        className="btn-primary px-8 py-3 rounded-full font-medium"
                        style={{
                          background: '#3b82f6',
                          color: '#ffffff',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = '#2563eb';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = '#3b82f6';
                        }}
                      >
                        Agendar
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        <footer className="px-6 py-12 mt-20" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-xl font-bold mb-4" style={{ color: '#3b82f6' }}>BMB ESTÉTICA AUTOMOTIVA</h3>
                <p className="mb-2" style={{ color: '#a1a1aa' }}>
                  Transformamos seu veículo com cuidado profissional e produtos premium.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4" style={{ color: '#f4f4f5' }}>Localização</h4>
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 mt-1" style={{ color: '#3b82f6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="font-medium" style={{ color: '#f4f4f5' }}>RUA JUIZ JACOB GOLDEMBERG, 4</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center pt-8" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <p style={{ color: '#71717a' }}>&copy; 2025 BMB ESTÉTICA AUTOMOTIVA. Todos os direitos reservados.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Home;