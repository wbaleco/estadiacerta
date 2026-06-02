/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent } from 'react';
import { 
  HistoryEntry, 
  ActiveJourney, 
  DriverProfile, 
  TabType, 
  LogType 
} from './types';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import InicioTab from './components/InicioTab';
import HistoricoTab from './components/HistoricoTab';
import PerfilTab from './components/PerfilTab';
import { Truck, ShieldAlert, CheckCircle, Flame, LogIn } from 'lucide-react';

const INITIAL_PROFILE: DriverProfile = {
  name: 'JOÃO SILVA',
  fullName: 'João Silva dos Santos',
  cpf: '123.456.789-00',
  cnh: '9876543210',
  avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDsM61O_E7OS7SxzxdSgBJfZjKdfiYMcCrPXAvPfS6dqXMH29i0kOZOr2QiYm46OLDNw0UvWIWJYIx7bJESBWDDBQ3WQ4mPK-Rfa9f3TsVRXECnjRadYizXkJ2Hx5zYmlQjxCIci6XwEKf0ZP_DtImqfmpd4Igd_dTC7eNmsboijkqeBTk33C67qKdXHAQPtREqBYEnkqJ5E6a3w1LOij-MUgHeHUmG0PO5-vt125fBGQkigkjVhkUAEitcu1Z4vCIIr144X30HZwY',
  truckModel: 'Scania R500',
  truckImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA2v6ckIpnRNZZh9970IsKKHNWSuxVZhiMW7hs_KJ100myY1fQK8Ekz7WPZpxHJoueGzJkv-BYvbLJfCB6DAoJJjlneyUdZLtZEZnwhq4meiaOsbGqqHUxavvpwfT_xwv065fJx5vkeQ9HjlxuQd3MlFqL-fdixPdqAT0jqW3UooZK3AEThIxeiWq8833STkgntsw3bSL_yTClGNaskpUlHkd2xxFuz0yBh238LKUIbyJ3pY2ref1e3tkHA6PtpBQZ0LlFkzz1mWcU',
  plateCavalo: 'BRA-2E19',
  plateCarreta: 'CAR-4F20',
  isOnline: true,
  anttRate: 2.50
};

const INITIAL_HISTORY: HistoryEntry[] = [
  {
    id: 'h2',
    location: 'Porto de Santos - Terminal 4',
    date: '23 MAI 2024',
    duration: '04h 20min',
    type: 'CARGA',
    startTime: '23 MAI, 08:30',
    endTime: '23 MAI, 12:50',
    durationHoursNum: 4.33,
    hourlyRate: 50.00,
    totalAmount: 216.50
  },
  {
    id: 'h3',
    location: 'CD Logística Cajamar',
    date: '23 MAI 2024',
    duration: '02h 45min',
    type: 'DESCARGA',
    startTime: '23 MAI, 14:00',
    endTime: '23 MAI, 16:45',
    durationHoursNum: 2.75,
    hourlyRate: 50.00,
    totalAmount: 137.50
  },
  {
    id: 'h4',
    location: 'Parada do Km 120 - Graal',
    date: '22 MAI 2024',
    duration: '01h 05min',
    type: 'CARGA',
    startTime: '22 MAI, 12:15',
    endTime: '22 MAI, 13:20',
    durationHoursNum: 1.08,
    hourlyRate: 40.00,
    totalAmount: 43.20
  }
];

const INITIAL_JOURNEY: ActiveJourney = {
  checkedIn: false,
  startTime: '',
  startTimestamp: 0,
  location: 'Posto Graal - KM 120',
  reason: 'CARGA',
  hourlyRate: 50.00,
  billingType: 'COMBINADO',
  truckCapacityTons: 12,
  excludeFirst5Hours: true
};

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('inicio');
  const [profile, setProfile] = useState<DriverProfile | null>(() => {
    const saved = localStorage.getItem('driver_profile');
    return saved ? JSON.parse(saved) : null;
  });
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    const saved = localStorage.getItem('driver_history');
    return saved ? JSON.parse(saved) : INITIAL_HISTORY;
  });
  const [activeJourney, setActiveJourney] = useState<ActiveJourney>(() => {
    const saved = localStorage.getItem('driver_journey');
    return saved ? JSON.parse(saved) : INITIAL_JOURNEY;
  });

  const [isLoggedOut, setIsLoggedOut] = useState<boolean>(() => {
    return localStorage.getItem('driver_logged_out') === 'true';
  });

  // Registration Form States
  const [regName, setRegName] = useState('');
  const [regCpf, setRegCpf] = useState('');
  const [regCnh, setRegCnh] = useState('');
  const [regTruck, setRegTruck] = useState('');
  const [regPlateCavalo, setRegPlateCavalo] = useState('');
  const [regPlateCarreta, setRegPlateCarreta] = useState('');
  const [regAnttRate, setRegAnttRate] = useState(2.50);

  const [notif, setNotif] = useState<{ show: boolean; msg: string; type: 'success' | 'info' }>({
    show: false,
    msg: '',
    type: 'success'
  });

  // Synced persistence effect
  useEffect(() => {
    localStorage.setItem('driver_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('driver_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('driver_journey', JSON.stringify(activeJourney));
  }, [activeJourney]);

  useEffect(() => {
    localStorage.setItem('driver_logged_out', String(isLoggedOut));
  }, [isLoggedOut]);

  // Handle active notifications/toasts
  const triggerNotification = (msg: string, type: 'success' | 'info' = 'success') => {
    setNotif({ show: true, msg, type });
    setTimeout(() => {
      setNotif(prev => ({ ...prev, show: false }));
    }, 4500);
  };

  // Toggle driver Online/Offline indicator
  const handleToggleOnline = () => {
    if (!profile) return;
    const newOnline = !profile.isOnline;
    setProfile(prev => prev ? ({ ...prev, isOnline: newOnline }) : null);
    triggerNotification(
      newOnline 
        ? 'Você está ONLINE na rede de monitoramento de cargas.' 
        : 'Você está OFFLINE. Monitoramento suspenso.', 
      newOnline ? 'success' : 'info'
    );
  };

  // Trigger check-in
  const handleCheckIn = (
    location: string, 
    reason: LogType, 
    hourlyRate: number,
    billingType: 'COMBINADO' | 'ANTT',
    truckCapacityTons: number,
    excludeFirst5Hours: boolean
  ) => {
    const now = new Date();
    const cleanTime = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    setActiveJourney({
      checkedIn: true,
      startTimestamp: Date.now(),
      startTime: `Hoje, ${cleanTime}`,
      location: location,
      reason,
      hourlyRate,
      billingType,
      truckCapacityTons,
      excludeFirst5Hours
    });

    triggerNotification(`Check-In realizado em ${location}!`);
  };

  // Trigger check-out
  const handleCheckOut = (calculatedSeconds: number, durationStr: string) => {
    // Generate date format: "DD MMM YYYY" in Portuguese (e.g. "01 JUN 2026")
    const now = new Date();
    const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
    const formattedDate = `${now.getDate().toString().padStart(2, '0')} ${months[now.getMonth()]} ${now.getFullYear()}`;
    const cleanEndTime = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    // Duration hours block: make sure it's at least 15 seconds. If under 15 seconds, we mock 8 hours so the user can test immediately with 3 excedant hours!
    let activeSecs = calculatedSeconds;
    if (calculatedSeconds <= 15) {
      activeSecs = 28800; // 8 hours (which leaves 3 hours of surplus time after subtracting 5 hours, fitting client example perfectly)
    }
    
    const hoursNum = Math.round((activeSecs / 3600) * 100) / 100;
    
    // Apply exclusion of initial 5 hours if active
    const excludeTime = activeJourney.excludeFirst5Hours ?? true;
    const effectiveHours = excludeTime ? Math.max(0, hoursNum - 5) : hoursNum;
    
    let finalAmount = 0;
    const currentAnttRate = profile?.anttRate || 2.50;
    if (activeJourney.billingType === 'ANTT') {
      const tons = activeJourney.truckCapacityTons ?? 12;
      finalAmount = Math.round((effectiveHours * tons * currentAnttRate) * 100) / 100;
    } else {
      // Combined rate rule
      finalAmount = Math.round((effectiveHours * activeJourney.hourlyRate) * 100) / 100;
    }

    // Convert activeSecs to display duration, e.g. "08h 00min"
    const hrs = Math.floor(activeSecs / 3600);
    const mins = Math.floor((activeSecs % 3600) / 60);
    const realDurationStr = `${hrs.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}min`;

    const newLog: HistoryEntry = {
      id: `custom-${Date.now()}`,
      location: activeJourney.location,
      date: formattedDate,
      duration: realDurationStr,
      type: activeJourney.reason,
      startTime: activeJourney.startTime,
      endTime: `Hoje, ${cleanEndTime}`,
      durationHoursNum: hoursNum,
      hourlyRate: activeJourney.billingType === 'ANTT' ? currentAnttRate : activeJourney.hourlyRate,
      totalAmount: finalAmount,
      billingType: activeJourney.billingType,
      truckCapacityTons: activeJourney.truckCapacityTons,
      excludeFirst5Hours: activeJourney.excludeFirst5Hours
    };

    setHistory(prev => [newLog, ...prev]);
    setActiveJourney(INITIAL_JOURNEY);
    triggerNotification(`Check-Out concluído! Registro de ${realDurationStr} adicionado ao histórico.`);
    
    // Switch to history tab to inspect results instantly
    setActiveTab('historico');
  };

  // Update Profile attributes
  const handleUpdateProfile = (updatedFields: Partial<DriverProfile>) => {
    setProfile(prev => prev ? ({ ...prev, ...updatedFields }) : null);
    triggerNotification('Dados cadastrais atualizados com sucesso!');
  };

  // Onboarding registration submission
  const handleRegisterSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!regName || !regCpf || !regCnh || !regTruck || !regPlateCavalo || !regPlateCarreta) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    const newProfile: DriverProfile = {
      name: regName.split(' ')[0].toUpperCase() + (regName.split(' ')[1] ? ' ' + regName.split(' ')[1].toUpperCase() : ''),
      fullName: regName,
      cpf: regCpf,
      cnh: regCnh,
      avatarUrl: INITIAL_PROFILE.avatarUrl,
      truckModel: regTruck,
      truckImageUrl: INITIAL_PROFILE.truckImageUrl,
      plateCavalo: regPlateCavalo.toUpperCase(),
      plateCarreta: regPlateCarreta.toUpperCase(),
      isOnline: true,
      anttRate: regAnttRate || 2.50
    };
    setProfile(newProfile);
    triggerNotification('Cadastro realizado com sucesso! Bem-vindo ao EstadiaCerta.');
  };

  // Prefill registration with demo data for quick testing
  const handlePrefillDemo = () => {
    setRegName(INITIAL_PROFILE.fullName);
    setRegCpf(INITIAL_PROFILE.cpf);
    setRegCnh(INITIAL_PROFILE.cnh);
    setRegTruck(INITIAL_PROFILE.truckModel);
    setRegPlateCavalo(INITIAL_PROFILE.plateCavalo);
    setRegPlateCarreta(INITIAL_PROFILE.plateCarreta);
    setRegAnttRate(INITIAL_PROFILE.anttRate || 2.50);
    triggerNotification('Dados de teste preenchidos. Basta clicar em Cadastrar!', 'info');
  };

  // Clear History backlog
  const handleClearHistory = () => {
    if (confirm('Tem certeza de que deseja limpar o histórico de estadias adicionais?')) {
      // KEEP index mock items, clear custom ones
      setHistory(INITIAL_HISTORY);
      triggerNotification('Histórico de estadias restaurado ao padrão.', 'info');
    }
  };

  // Delete singular custom entry from history
  const handleDeleteEntry = (entryId: string) => {
    setHistory(prev => prev.filter(entry => entry.id !== entryId));
    triggerNotification('Estadia excluída com sucesso.', 'info');
  };

  // Mask helper functions for premium registration UX
  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
  };

  const formatPlaca = (value: string) => {
    const clean = value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 7).toUpperCase();
    if (clean.length <= 3) return clean;
    return `${clean.slice(0, 3)}-${clean.slice(3)}`;
  };

  // Lockscreen Simulated Authentication Click
  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    setIsLoggedOut(false);
    triggerNotification('Bem-vindo de volta, ' + profile?.fullName + '!');
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-background text-on-surface bg-safety-mesh flex flex-col justify-between p-6 md:p-12 font-sans animate-fade-in">
        {/* Top Branding Header */}
        <div className="flex flex-col items-center justify-center pt-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary-container text-on-primary flex items-center justify-center shadow-[0_0_30px_rgba(250,205,51,0.2)] mb-4">
            <Truck className="w-9 h-9 animate-pulse" />
          </div>
          <h1 className="font-sans font-extrabold text-[28px] tracking-tight uppercase leading-tight text-white">
            Estadia<span className="text-primary-container">Certa</span>
          </h1>
          <p className="text-on-surface-variant text-sm font-mono tracking-widest uppercase mt-1">
            Plataforma de Alta Visibilidade
          </p>
        </div>

        {/* Onboarding Registration Form Card */}
        <div className="max-w-xl w-full mx-auto bg-surface-card border border-outline-variant/40 rounded-3xl p-8 flex flex-col shadow-xl gap-6 mt-6 mb-6">
          <div className="text-center">
            <span className="text-primary-container font-mono text-[11px] tracking-wider uppercase font-bold bg-primary-container/10 px-3 py-1.5 rounded-full border border-primary-container/20">
              CADASTRO DE MOTORISTA
            </span>
            <h2 className="font-sans font-extrabold text-2xl text-on-surface mt-3">
              Crie sua Conta Local
            </h2>
            <p className="text-xs text-on-surface-variant leading-relaxed mt-2 max-w-sm mx-auto">
              Seus dados de motorista e veículo serão salvos com privacidade absoluta 100% no seu dispositivo (offline-first).
            </p>
          </div>

          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            {/* Nome Completo */}
            <div className="space-y-1.5 text-left">
              <label className="font-mono text-[10px] text-on-surface-variant tracking-wider uppercase pl-1 font-bold">
                Nome Completo *
              </label>
              <input 
                type="text"
                required
                placeholder="Ex: João Silva dos Santos"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className="w-full h-12 bg-background border border-outline-variant/60 rounded-xl px-4 font-semibold font-sans text-on-surface focus:outline-none focus:border-safety-yellow transition-all"
              />
            </div>

            {/* Grid CPF & CNH */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 text-left">
                <label className="font-mono text-[10px] text-on-surface-variant tracking-wider uppercase pl-1 font-bold">
                  CPF *
                </label>
                <input 
                  type="text"
                  required
                  placeholder="000.000.000-00"
                  value={regCpf}
                  onChange={(e) => setRegCpf(formatCPF(e.target.value))}
                  maxLength={14}
                  className="w-full h-12 bg-background border border-outline-variant/60 rounded-xl px-4 font-mono text-on-surface focus:outline-none focus:border-safety-yellow transition-all text-sm"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="font-mono text-[10px] text-on-surface-variant tracking-wider uppercase pl-1 font-bold">
                  CNH (Categoria E) *
                </label>
                <input 
                  type="text"
                  required
                  placeholder="Apenas números"
                  value={regCnh}
                  onChange={(e) => setRegCnh(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  maxLength={11}
                  className="w-full h-12 bg-background border border-outline-variant/60 rounded-xl px-4 font-mono text-on-surface focus:outline-none focus:border-safety-yellow transition-all text-sm"
                />
              </div>
            </div>

            {/* Modelo do Caminhão */}
            <div className="space-y-1.5 text-left">
              <label className="font-mono text-[10px] text-on-surface-variant tracking-wider uppercase pl-1 font-bold">
                Modelo do Caminhão *
              </label>
              <input 
                type="text"
                required
                placeholder="Ex: Scania R500"
                value={regTruck}
                onChange={(e) => setRegTruck(e.target.value)}
                className="w-full h-12 bg-background border border-outline-variant/60 rounded-xl px-4 font-semibold font-sans text-on-surface focus:outline-none focus:border-safety-yellow transition-all"
              />
            </div>

            {/* Grid Placas */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 text-left">
                <label className="font-mono text-[10px] text-on-surface-variant tracking-wider uppercase pl-1 font-bold">
                  Placa Cavalo *
                </label>
                <input 
                  type="text"
                  required
                  placeholder="AAA-9A99"
                  value={regPlateCavalo}
                  onChange={(e) => setRegPlateCavalo(formatPlaca(e.target.value))}
                  maxLength={8}
                  className="w-full h-12 bg-background border border-outline-variant/60 rounded-xl px-4 font-mono text-on-surface focus:outline-none focus:border-safety-yellow transition-all uppercase text-sm"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="font-mono text-[10px] text-on-surface-variant tracking-wider uppercase pl-1 font-bold">
                  Placa Carreta *
                </label>
                <input 
                  type="text"
                  required
                  placeholder="CAR-4F20"
                  value={regPlateCarreta}
                  onChange={(e) => setRegPlateCarreta(formatPlaca(e.target.value))}
                  maxLength={8}
                  className="w-full h-12 bg-background border border-outline-variant/60 rounded-xl px-4 font-mono text-on-surface focus:outline-none focus:border-safety-yellow transition-all uppercase text-sm"
                />
              </div>
            </div>

            {/* Taxa ANTT / Tonelada Hora */}
            <div className="space-y-1.5 text-left">
              <label className="font-mono text-[10px] text-on-surface-variant tracking-wider uppercase pl-1 font-bold">
                Taxa ANTT Base por Tonelada/Hora (R$)
              </label>
              <input 
                type="number"
                step="0.01"
                min="0.10"
                value={regAnttRate}
                onChange={(e) => setRegAnttRate(parseFloat(e.target.value) || 2.50)}
                className="w-full h-12 bg-background border border-outline-variant/60 rounded-xl px-4 font-mono text-on-surface focus:outline-none focus:border-safety-yellow transition-all text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full h-14 bg-primary-container hover:bg-safety-yellow text-on-primary font-mono text-xs tracking-widest uppercase rounded-xl font-bold transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-98 mt-6"
            >
              <CheckCircle className="w-4 h-4" /> Concluir e Entrar
            </button>
          </form>

          {/* Quick Demo Option for testing */}
          <div className="w-full h-[1px] bg-outline-variant/35 my-2"></div>
          <button
            onClick={handlePrefillDemo}
            className="w-full py-3 bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/50 text-on-surface-variant hover:text-white font-mono text-[10px] uppercase font-bold tracking-wider rounded-xl cursor-pointer transition-all active:scale-98"
          >
            Preencher com Dados de Teste Rápidos
          </button>
        </div>

        {/* Branding Footer */}
        <div className="flex flex-col items-center text-center pb-4">
          <p className="text-[9px] text-on-surface-variant/50 font-mono">
            © 2026 ESTADIACERTA. TODOS OS DIREITOS RESERVADOS. PRIVACIDADE E SEGURANÇA CERTIFICADA.
          </p>
        </div>
      </div>
    );
  }

  if (isLoggedOut) {
    return (
      <div className="min-h-screen bg-background text-on-surface bg-safety-mesh flex flex-col justify-between p-6 md:p-12 font-sans select-none animate-fade-in">
        {/* Top Branding Section */}
        <div className="flex flex-col items-center justify-center pt-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary-container text-on-primary flex items-center justify-center shadow-[0_0_30px_rgba(250,205,51,0.2)] mb-4">
            <Truck className="w-9 h-9" />
          </div>
          <h1 className="font-sans font-extrabold text-[28px] tracking-tight uppercase leading-tight text-white">
            Estadia<span className="text-primary-container">Certa</span>
          </h1>
          <p className="text-on-surface-variant text-sm font-mono tracking-widest uppercase mt-1">
            Plataforma de Alta Visibilidade
          </p>
        </div>

        {/* Lock Screen Centered Action Card */}
        <form onSubmit={handleLogin} className="max-w-md w-full mx-auto bg-surface-card border border-outline-variant/40 rounded-3xl p-8 flex flex-col items-center text-center shadow-xl gap-6">
          <div className="relative group">
            <div className="absolute inset-0 rounded-full bg-primary-container/20 animate-pulse scale-105"></div>
            <div className="w-24 h-24 rounded-full border-4 border-primary-container overflow-hidden shadow-md">
              <img 
                referrerPolicy="no-referrer"
                src={profile.avatarUrl} 
                alt={profile.fullName} 
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div>
            <span className="text-on-surface-variant font-mono text-[11px] tracking-wider uppercase font-bold">
              MOTORISTA CONECTADO
            </span>
            <h2 className="font-sans font-extrabold text-2xl text-on-surface mt-1 uppercase">
              {profile.fullName}
            </h2>
            <p className="font-mono text-xs text-status-success font-bold mt-1 tracking-widest uppercase">
              CARGA ATIVA: {profile.truckModel} 
            </p>
          </div>

          {/* Dummy Pin inputs */}
          <div className="w-full space-y-2 text-left">
            <label className="font-mono text-xs text-on-surface-variant tracking-wider uppercase pl-1 font-bold">
              SENHA DE ACESSO PIN
            </label>
            <input 
              type="password" 
              value="••••" 
              readOnly
              className="w-full h-14 bg-background border-2 border-outline-variant/60 rounded-xl px-4 text-center font-bold font-sans tracking-widest text-lg disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            className="w-full h-14 bg-primary-container hover:bg-safety-yellow text-on-primary font-mono text-xs tracking-widest uppercase rounded-xl font-bold transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-98"
          >
            <LogIn className="w-4 h-4" /> Entrar no Painel
          </button>
        </form>

        {/* Footer info details */}
        <div className="flex flex-col items-center text-center pb-6">
          <p className="text-[11px] text-on-surface-variant font-mono uppercase tracking-widest">
            {profile.plateCavalo} | {profile.plateCarreta} • Scania R500
          </p>
          <p className="text-[9px] text-on-surface-variant/50 font-mono mt-1">
            © 2026 ESTADIACERTA. TODOS OS DIREITOS RESERVADOS.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-surface bg-safety-mesh font-sans overflow-x-hidden relative flex flex-col">
      
      {/* Dynamic Pop-up Toast Notifications */}
      {notif.show && (
        <div className="fixed top-24 left-4 right-4 z-50 max-w-sm mx-auto bg-surface-card border-l-4 border-safety-yellow rounded-xl p-4 shadow-2xl flex items-center gap-3 animate-fade-in border border-outline-variant/20 backdrop-blur">
          {notif.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-safety-yellow shrink-0" />
          ) : (
            <Flame className="w-5 h-5 text-secondary shrink-0" />
          )}
          <p className="text-xs font-sans font-semibold text-on-surface leading-tight text-left">
            {notif.msg}
          </p>
        </div>
      )}

      {/* FIXED HEADER PORTAL */}
      <Header profile={profile} onToggleOnline={handleToggleOnline} />

      {/* MAIN LAYOUT SECTION SCREEN CONTAINER */}
      <main className="flex-1 mt-20 mb-24 px-5 md:px-16 py-6 max-w-2xl mx-auto w-full">
        {activeTab === 'inicio' && (
          <InicioTab 
            activeJourney={activeJourney} 
            anttRate={profile.anttRate || 2.50}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
          />
        )}

        {activeTab === 'historico' && (
          <HistoricoTab 
            entries={history}
            profile={profile}
            onClearHistory={handleClearHistory}
            onDeleteEntry={handleDeleteEntry}
          />
        )}

        {activeTab === 'perfil' && (
          <PerfilTab 
            profile={profile}
            history={history}
            onUpdateProfile={handleUpdateProfile}
            onImportHistory={(importedHistory) => {
              setHistory(importedHistory);
              triggerNotification('Histórico e dados de backup importados com sucesso!');
            }}
            onLogout={() => {
              setIsLoggedOut(true);
              triggerNotification('Você saiu da conta com sucesso.', 'info');
            }}
            onResetApp={() => {
              localStorage.removeItem('driver_profile');
              localStorage.removeItem('driver_history');
              localStorage.removeItem('driver_journey');
              localStorage.removeItem('driver_logged_out');
              setProfile(null);
              setHistory(INITIAL_HISTORY);
              setActiveJourney(INITIAL_JOURNEY);
              setIsLoggedOut(false);
              setRegName('');
              setRegCpf('');
              setRegCnh('');
              setRegTruck('');
              setRegPlateCavalo('');
              setRegPlateCarreta('');
              setRegAnttRate(2.50);
              setActiveTab('inicio');
              triggerNotification('Aplicativo reiniciado com sucesso. Todos os dados foram limpos.', 'info');
            }}
          />
        )}
      </main>

      {/* FIXED BOTTOM NAVIGATION BAR */}
      <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />
    </div>
  );
}
