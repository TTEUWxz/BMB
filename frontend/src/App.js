import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import Home from './pages/Home';
import BookingForm from './pages/BookingForm';
import Confirmation from './pages/Confirmation';
import AdminDashboard from './pages/AdminDashboard';
import NotificationSetup from './pages/NotificationSetup';
import './App.css';

function App() {
  return (
    <div className="App" style={{ minHeight: '100vh', background: '#09090b' }}>
      <Toaster position="top-center" richColors />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/agendar" element={<BookingForm />} />
          <Route path="/confirmacao/:id" element={<Confirmation />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/notificacoes" element={<NotificationSetup />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;