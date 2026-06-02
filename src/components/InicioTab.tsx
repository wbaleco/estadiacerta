/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  LogOut, 
  Gauge, 
  Upload, 
  Download, 
  Moon, 
  Wrench, 
  MapPin, 
  Clock,
  Compass,
  Loader2
} from 'lucide-react';
import { LogType, ActiveJourney, HistoryEntry } from '../types';

interface InicioTabProps {
  activeJourney: ActiveJourney;
  anttRate: number;
  onCheckIn: (
    location: string, 
    reason: LogType, 
    hourlyRate: number,
    billingType: 'COMBINADO' | 'ANTT',
    truckCapacityTons: number,
    excludeFirst5Hours: boolean
  ) => void;
  onCheckOut: (calculatedSeconds: number, finalDuration: string) => void;
}

export default function InicioTab({ activeJourney, anttRate, onCheckIn, onCheckOut }: InicioTabProps) {
  // checked out state variables
  const [locationInput, setLocationInput] = useState<string>('Posto Graal - KM 120');
  const [hourlyRateInput, setHourlyRateInput] = useState<string>('50');
  const [billingType, setBillingType] = useState<'COMBINADO' | 'ANTT'>('COMBINADO');
  const [truckCapacityTonsInput, setTruckCapacityTonsInput] = useState<string>('12');
  const [excludeFirst5Hours, setExcludeFirst5Hours] = useState<boolean>(true);
  const [selectedReason, setSelectedReason] = useState<LogType>('CARGA');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);

  const handleFetchGPSLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocalização não é suportada pelo seu navegador.');
      return;
    }

    setGpsLoading(true);
    setErrorMsg('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            {
              headers: {
                'Accept-Language': 'pt-BR'
              }
            }
          );
          if (!response.ok) throw new Error('Falha na resposta da rede.');
          const data = await response.json();
          
          if (data && data.display_name) {
            const addr = data.address;
            const road = addr.road || addr.highway || addr.pedestrian || '';
            const houseNumber = addr.house_number ? `, ${addr.house_number}` : '';
            const suburb = addr.suburb || addr.neighbourhood ? ` - ${addr.suburb || addr.neighbourhood}` : '';
            const city = addr.city || addr.town || addr.village || '';
            const state = addr.state ? ` - ${addr.state}` : '';
            
            const cleanAddress = road 
              ? `${road}${houseNumber}${suburb}, ${city}${state}` 
              : data.display_name.split(',').slice(0, 3).join(',');

            setLocationInput(cleanAddress);
          } else {
            setLocationInput(`Coordenadas: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
          }
        } catch (err) {
          console.error(err);
          setLocationInput(`Coordenadas: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
        } finally {
          setGpsLoading(false);
        }
      },
      (error) => {
        console.error(error);
        setGpsLoading(false);
        if (error.code === error.PERMISSION_DENIED) {
          setErrorMsg('Permissão de GPS negada. Ative a localização nas configurações.');
        } else {
          setErrorMsg('Não foi possível obter a sua localização GPS.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // chronometer state variables (when checked in)
  const [elaspedSeconds, setElapsedSeconds] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (activeJourney.checkedIn) {
      // Calculate initial elapsed time
      const computeElapsed = () => {
        const diffMs = Date.now() - activeJourney.startTimestamp;
        return Math.max(0, Math.floor(diffMs / 1000));
      };

      setElapsedSeconds(computeElapsed());

      timerRef.current = setInterval(() => {
        setElapsedSeconds(computeElapsed());
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setElapsedSeconds(0);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [activeJourney.checkedIn, activeJourney.startTimestamp]);

  // Formats seconds into HH:MM:SS
  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCheckInClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationInput.trim()) {
      setErrorMsg('Por favor, informe a localização do estabelecimento.');
      return;
    }
    
    let rate = 50;
    if (billingType === 'COMBINADO') {
      rate = parseFloat(hourlyRateInput);
      if (isNaN(rate) || rate <= 0) {
        setErrorMsg('Por favor, insira um valor de hora válido maior que zero.');
        return;
      }
    }

    let capacity = 12;
    if (billingType === 'ANTT') {
      capacity = parseFloat(truckCapacityTonsInput);
      if (isNaN(capacity) || capacity <= 0) {
        setErrorMsg('Por favor, insira a capacidade de carga em toneladas.');
        return;
      }
    }

    setErrorMsg('');
    // Pass everything on check in
    onCheckIn(
      locationInput, 
      selectedReason, 
      billingType === 'ANTT' ? anttRate : rate, 
      billingType, 
      capacity, 
      excludeFirst5Hours
    );
  };

  const handleCheckOutClick = () => {
    // Generate readable duration string, e.g., "04h 20min" or "00h 15min"
    const hrs = Math.floor(elaspedSeconds / 3600);
    const mins = Math.floor((elaspedSeconds % 3600) / 60);
    const durationStr = `${hrs.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}min`;
    onCheckOut(elaspedSeconds, durationStr);
  };

  // Get corresponding icon for reasons
  const getReasonIcon = (reasonType: LogType, className = "w-5 h-5") => {
    switch (reasonType) {
      case 'CARGA': return <Upload className={className} />;
      case 'DESCARGA': return <Download className={className} />;
      case 'DESCANSO': return <Moon className={className} />;
      case 'QUEBRA': return <Wrench className={className} />;
      default: return <Clock className={className} />;
    }
  };

  // Live subtotal calculation based on the chronometer elapsed seconds and active billing mode
  const getCurrentSubtotal = () => {
    // To make immediate UI testing fun, if elapsed is under 15 seconds, we can preview a simulated minimum of 8.0 hours stay
    let displaySecs = elaspedSeconds;
    if (elaspedSeconds <= 15) {
      displaySecs = 28800; // 8.0 hours
    }
    
    const rawHours = displaySecs / 3600;
    const hoursNum = Math.round(rawHours * 100) / 100;
    
    const excludeTime = activeJourney.excludeFirst5Hours ?? true;
    const effectiveHours = excludeTime ? Math.max(0, hoursNum - 5) : hoursNum;
    
    if (activeJourney.billingType === 'ANTT') {
      const tons = activeJourney.truckCapacityTons ?? 12;
      return effectiveHours * tons * anttRate;
    } else {
      return effectiveHours * activeJourney.hourlyRate;
    }
  };

  return (
    <div className="space-y-8 pb-32 animate-fade-in">
      {/* 1. STATUS CARD */}
      <section className="mt-2">
        {activeJourney.checkedIn ? (
          <div className="bg-surface-card border-l-4 border-safety-yellow p-5 rounded-xl flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-4">
              <div className="bg-safety-yellow/10 w-11 h-11 rounded-full flex items-center justify-center text-safety-yellow">
                <Clock className="w-5.5 h-5.5 animate-spin" style={{ animationDuration: '25s' }} />
              </div>
              <div>
                <h2 className="font-mono text-xs text-safety-yellow font-bold tracking-widest uppercase">
                  EM JORNADA
                </h2>
                <p className="text-on-surface font-sans font-bold text-lg select-none">
                  Controle de Estadia Ativo
                </p>
              </div>
            </div>
            <span className="text-[10px] md:text-xs text-on-surface-variant font-mono bg-surface-container px-3 py-1.5 rounded-full uppercase tracking-wider">
              Aguardando Saída
            </span>
          </div>
        ) : (
          <div className="bg-surface-card border-l-4 border-primary-container p-5 rounded-xl flex items-center justify-between shadow-lg">
            <div>
              <h2 className="font-mono text-xs text-on-surface-variant mb-1 uppercase tracking-widest font-bold">
                STATUS ATUAL
              </h2>
              <p className="font-sans text-[20px] font-bold text-on-surface">
                Você está fora de jornada
              </p>
            </div>
            <div className="bg-surface-container-high w-14 h-14 rounded-full flex items-center justify-center text-primary-container">
              <Moon className="w-7 h-7" />
            </div>
          </div>
        )}
      </section>

      {/* 2. MAIN TIMER OR CHECK-IN HERO ACCORDING TO STATE */}
      {activeJourney.checkedIn ? (
        /* ================= EM JORNADA STATE ================= */
        <section className="flex flex-col items-center justify-center py-6">
          <div className="flex flex-col items-center justify-center space-y-2 mb-10 w-full text-center">
            <p className="font-mono text-xs tracking-widest text-on-surface-variant uppercase font-bold">
              TEMPO TOTAL DE ESTADIA (PERMANÊNCIA)
            </p>
            <div className="text-[44px] md:text-[56px] font-sans font-extrabold text-on-surface tracking-tighter tabular-nums text-center" id="chronometer">
              {formatTime(elaspedSeconds)}
            </div>
          </div>

          {/* Location details */}
          <div className="w-full flex flex-col items-center mb-10 text-center">
            <div className="flex items-center gap-2 mb-1 justify-center">
              <MapPin className="w-5.5 h-5.5 text-safety-yellow shrink-0" />
              <p className="font-sans font-extrabold text-[22px] text-on-surface leading-tight">
                {activeJourney.location}
              </p>
            </div>
            <p className="text-on-surface-variant text-xs font-mono uppercase tracking-widest mt-1">
              REGISTRO DE ESTADIA ATIVA
            </p>
          </div>

          {/* Big action button */}
          <div className="relative group mb-12">
            {/* Decorative pulse ring for glow */}
            <div className="absolute inset-0 bg-status-critical/20 rounded-full blur-2xl animate-pulse scale-110"></div>
            <button 
              onClick={handleCheckOutClick}
              className="relative w-[180px] h-[180px] rounded-full bg-status-critical border-4 border-surface text-on-surface flex flex-col items-center justify-center hero-glow-critical active:scale-95 transition-transform duration-150 cursor-pointer text-center group"
            >
              <LogOut className="w-12 h-12 text-on-surface mb-2 animate-pulse" />
              <span className="font-sans text-lg font-extrabold tracking-wider uppercase text-on-surface">
                CHECK-OUT
              </span>
            </button>
          </div>

          {/* Check-In Summary Info Card (Modified to display Accumulating billing subtotal!) */}
          <div className="w-full bg-surface-container-low rounded-2xl p-6 border border-outline-variant/30 shadow-md">
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-outline-variant/20">
              <div className="flex flex-col gap-1 pr-2">
                <span className="font-mono text-[10px] text-on-surface-variant tracking-wider uppercase font-extrabold">MOTIVO</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="text-safety-yellow">
                    {getReasonIcon(activeJourney.reason, "w-4.5 h-4.5")}
                  </div>
                  <p className="font-sans font-extrabold text-[15px] text-on-surface uppercase tracking-wider">
                    {activeJourney.reason}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-1 pl-2">
                <span className="font-mono text-[10px] text-on-surface-variant tracking-wider uppercase font-extrabold">REGRA DE COBRANÇA</span>
                <p className="font-sans font-extrabold text-[15px] text-safety-yellow mt-0.5 uppercase">
                  {activeJourney.billingType === 'ANTT' ? 'Lei ANTT' : 'Combinado'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 py-3 border-b border-outline-variant/10 text-xs">
              <div>
                <span className="text-on-surface-variant block font-sans">Parâmetro de Cálculo:</span>
                <span className="font-sans font-bold text-on-surface mt-0.5 block">
                  {activeJourney.billingType === 'ANTT' 
                    ? `R$ ${anttRate.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/ton (${activeJourney.truckCapacityTons} T)` 
                    : `R$ ${activeJourney.hourlyRate.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/h`}
                </span>
              </div>
              <div>
                <span className="text-on-surface-variant block font-sans">Carência 5 Horas:</span>
                <span className="font-sans font-bold text-on-surface mt-0.5 block">
                  {activeJourney.excludeFirst5Hours ? 'Ativa (Descontada)' : 'Desativada'}
                </span>
              </div>
            </div>

            {/* Live Charging Subtotal Section */}
            <div className="pt-4 flex justify-between items-center bg-surface-card/40 -mx-6 px-6 py-4 border-b border-outline-variant/20">
              <div className="flex flex-col">
                <span className="font-mono text-[10px] text-safety-yellow tracking-widest uppercase font-extrabold flex items-center gap-1.5 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-safety-yellow"></span>
                  COBRANÇA EM PROCESSO
                </span>
                <span className="text-[10px] text-on-surface-variant font-mono mt-0.5 block">
                  {activeJourney.billingType === 'ANTT' 
                    ? `Cálculo: ${activeJourney.excludeFirst5Hours ? '(Tempo - 5h)' : 'Tempo'} x ${activeJourney.truckCapacityTons}t x R$ ${anttRate.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                    : `Cálculo: ${activeJourney.excludeFirst5Hours ? '(Tempo - 5h)' : 'Tempo'} x R$ ${activeJourney.hourlyRate}`}
                </span>
              </div>
              <p className="font-mono text-xl md:text-2xl font-extrabold text-safety-yellow tracking-tight">
                R$ {getCurrentSubtotal().toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>

            <div className="pt-4 flex justify-between items-center text-xs">
              <span className="font-mono text-[10px] text-on-surface-variant tracking-wider uppercase font-extrabold">ENTRADA CONSTATADA</span>
              <span className="font-sans text-on-surface font-semibold">{activeJourney.startTime}</span>
            </div>
          </div>
        </section>
      ) : (
        /* ================= FORA DE JORNADA STATE ================= */
        <section className="flex flex-col gap-8">
          {/* Action Button */}
          <div className="flex flex-col items-center justify-center py-2">
            <div className="relative group mb-4">
              {/* Decorative glows */}
              <div className="absolute inset-0 rounded-full bg-primary-container/20 opacity-40 animate-ping"></div>
              <div className="absolute inset-0 rounded-full bg-primary-container/10 opacity-30 animate-pulse scale-110"></div>
              
              <button 
                onClick={handleCheckInClick}
                className="relative w-[180px] h-[180px] md:w-[200px] md:h-[200px] rounded-full bg-primary-container text-on-primary flex flex-col items-center justify-center hero-glow active:scale-95 transition-transform duration-150 border-8 border-background cursor-pointer text-center"
              >
                <Play className="w-11 h-11 mb-2 select-none" fill="currentColor" />
                <span className="font-sans text-lg font-extrabold tracking-wider uppercase text-on-primary select-none">
                  CHECK-IN
                </span>
              </button>
            </div>
          </div>

          {/* Check-In Setup Form (No odometer! Strictly based on Location, Rates, Billing Types, Exclusions and Motivos) */}
          <form onSubmit={handleCheckInClick} className="bg-surface-elevated p-6 rounded-2xl border border-outline-variant/40 flex flex-col gap-6 shadow-md">
            {errorMsg && (
              <div className="bg-status-critical/10 text-rose-400 p-3.5 rounded-xl border border-status-critical/30 text-xs font-mono">
                {errorMsg}
              </div>
            )}

            {/* LOCATION INPUT FIELD */}
            <div className="flex flex-col gap-2">
              <label htmlFor="location_input" className="font-mono text-xs text-on-surface-variant font-bold tracking-widest uppercase ml-1">
                LOCALIZAÇÃO DO ESTABELECIMENTO
              </label>
              <div className="relative flex items-center">
                {gpsLoading ? (
                  <Loader2 className="absolute left-4 w-5 h-5 text-primary-container animate-spin pointer-events-none shrink-0" />
                ) : (
                  <MapPin className="absolute left-4 w-5 h-5 text-primary-container pointer-events-none shrink-0" />
                )}
                <input 
                  id="location_input"
                  className="w-full h-[72px] bg-background border-outline-variant border-2 rounded-xl pl-12 pr-16 font-sans font-extrabold text-[16px] md:text-[18px] text-on-surface focus:border-safety-yellow focus:ring-0 transition-colors" 
                  placeholder={gpsLoading ? "Obtendo endereço pelo GPS..." : "Ex: Porto de Santos - Pier 3"} 
                  type="text"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  disabled={gpsLoading}
                />
                <button
                  type="button"
                  onClick={handleFetchGPSLocation}
                  disabled={gpsLoading}
                  className="absolute right-4 w-10 h-10 bg-surface-container-high hover:bg-primary-container text-on-surface-variant hover:text-on-primary rounded-lg flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50 active:scale-95 z-10"
                  title="Capturar localização exata via GPS"
                >
                  {gpsLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Compass className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="text-[11px] text-on-surface-variant/70 font-sans ml-1">
                {gpsLoading ? "Aguardando resposta do satélite e convertendo coordenadas..." : "Informe o local ou clique na bússola à direita para capturar pelo GPS."}
              </p>
            </div>

            {/* BILLING TYPE SELECTOR (COMBINADO VS ANTT) */}
            <div className="flex flex-col gap-2">
              <label className="font-mono text-xs text-on-surface-variant font-bold tracking-widest uppercase ml-1">
                FORMA DE CALCULAR ESTADIA / DEMURRAGE
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setBillingType('COMBINADO')}
                  className={`h-14 rounded-xl border-2 hover:bg-surface-container-highest transition-all duration-150 flex flex-col items-center justify-center px-2 text-center cursor-pointer ${
                    billingType === 'COMBINADO'
                      ? 'border-primary-container bg-surface-container-highest text-primary-container'
                      : 'border-outline-variant/40 bg-surface-container text-on-surface-variant'
                  }`}
                >
                  <span className="font-sans text-xs font-extrabold uppercase">Valor Combinado</span>
                  <span className="text-[9px] font-mono uppercase opacity-80 mt-0.5">Taxa Fixa por Hora</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBillingType('ANTT')}
                  className={`h-14 rounded-xl border-2 hover:bg-surface-container-highest transition-all duration-150 flex flex-col items-center justify-center px-2 text-center cursor-pointer ${
                    billingType === 'ANTT'
                      ? 'border-primary-container bg-surface-container-highest text-primary-container'
                      : 'border-outline-variant/40 bg-surface-container text-on-surface-variant'
                  }`}
                >
                  <span className="font-sans text-xs font-extrabold uppercase">Lei ANTT Oficial</span>
                  <span className="text-[9px] font-mono uppercase opacity-80 mt-0.5">R$ {anttRate.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / Ton. • Hora</span>
                </button>
              </div>
            </div>

            {/* CONDITIONAL BILLING DETAILED PARAMETERS */}
            {billingType === 'COMBINADO' ? (
              /* HOURLY COMBINED RATE */
              <div className="flex flex-col gap-2 animate-fade-in">
                <label htmlFor="rate_input" className="font-mono text-xs text-on-surface-variant font-bold tracking-widest uppercase ml-1">
                  VALOR DE HORA COMBINADO (R$ / HORA)
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-4 font-mono font-bold text-primary-container text-base pointer-events-none select-none shrink-0">
                    R$
                  </div>
                  <input 
                    id="rate_input"
                    className="w-full h-[72px] bg-background border-outline-variant border-2 rounded-xl pl-12 pr-4 font-mono font-extrabold text-xl text-on-surface focus:border-safety-yellow focus:ring-0 transition-colors font-semibold" 
                    placeholder="EX: 50.00" 
                    type="number"
                    step="any"
                    value={hourlyRateInput}
                    onChange={(e) => setHourlyRateInput(e.target.value)}
                  />
                </div>
                <p className="text-[11px] text-on-surface-variant/70 font-sans ml-1">Preço negociado diretamente por hora de permanência.</p>
              </div>
            ) : (
              /* VEHICLE CAPACITY FOR ANTT RULE */
              <div className="flex flex-col gap-2 animate-fade-in">
                <label htmlFor="capacity_input" className="font-mono text-xs text-on-surface-variant font-bold tracking-widest uppercase ml-1">
                  CAPACIDADE DE CARGA DO VEÍCULO (EM TONELADAS)
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-4 font-mono font-bold text-primary-container text-base pointer-events-none select-none shrink-0">
                    Tons
                  </div>
                  <input 
                    id="capacity_input"
                    className="w-full h-[72px] bg-background border-outline-variant border-2 rounded-xl pl-16 pr-4 font-mono font-extrabold text-xl text-on-surface focus:border-safety-yellow focus:ring-0 transition-colors" 
                    placeholder="EX: 12" 
                    type="number"
                    step="any"
                    value={truckCapacityTonsInput}
                    onChange={(e) => setTruckCapacityTonsInput(e.target.value)}
                  />
                </div>
                <p className="text-[11px] text-on-surface-variant/70 font-sans ml-1">Sua capacidade de faturamento padrão é R$ {anttRate.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} por Ton./Hora de carregamento excedente.</p>
              </div>
            )}

            {/* EXCLUSION OF THE FIRST 5 HOURS TOGGLE (TOLERÂNCIA LEGAL) */}
            <div className="p-4 bg-surface-container/60 rounded-xl border border-outline-variant/30 flex items-start gap-3">
              <input 
                id="exclude_toggle"
                type="checkbox"
                checked={excludeFirst5Hours}
                onChange={(e) => setExcludeFirst5Hours(e.target.checked)}
                className="w-5 h-5 rounded border-outline-variant bg-background text-primary-container focus:ring-primary-container shrink-0 mt-0.5 cursor-pointer"
              />
              <div className="flex flex-col">
                <label htmlFor="exclude_toggle" className="font-sans font-extrabold text-xs text-on-surface tracking-wider uppercase cursor-pointer select-none">
                  Desconsiderar primeiras 5 horas
                </label>
                <p className="text-[11px] text-on-surface-variant mt-1 leading-relaxed">
                  Tolerância regulamentada de carga/descarga da Lei nº 11.442/2007. Se marcado, a cobrança inicia a partir da 6ª hora.
                </p>
              </div>
            </div>

            {/* Cargo / Descarga Motivo Selection */}
            <div className="flex flex-col gap-3">
              <label className="font-mono text-xs text-on-surface-variant font-bold tracking-widest uppercase ml-1">
                MOTIVO DA ESTADIA ATIVA
              </label>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedReason('CARGA')}
                  className={`h-14 rounded-xl border-2 hover:bg-surface-container-highest transition-all duration-150 flex items-center justify-center gap-2.5 font-mono text-xs uppercase font-bold tracking-wider cursor-pointer ${
                    selectedReason === 'CARGA'
                      ? 'border-primary-container bg-surface-container-highest text-primary-container'
                      : 'border-outline-variant/40 bg-surface-container text-on-surface-variant'
                  }`}
                >
                  <Upload className="w-4.5 h-4.5 shrink-0" /> CARGA
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedReason('DESCARGA')}
                  className={`h-14 rounded-xl border-2 hover:bg-surface-container-highest transition-all duration-150 flex items-center justify-center gap-2.5 font-mono text-xs uppercase font-bold tracking-wider cursor-pointer ${
                    selectedReason === 'DESCARGA'
                      ? 'border-primary-container bg-surface-container-highest text-primary-container'
                      : 'border-outline-variant/40 bg-surface-container text-on-surface-variant'
                  }`}
                >
                  <Download className="w-4.5 h-4.5 shrink-0" /> DESCARGA
                </button>
              </div>
            </div>
          </form>
        </section>
      )}

      {/* Safety spacer */}
      <div className="h-12"></div>
    </div>
  );
}
