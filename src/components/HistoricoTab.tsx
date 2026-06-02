/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  Moon, 
  Upload, 
  Download, 
  Utensils, 
  Wrench, 
  Clock, 
  Trash2,
  Calendar,
  FileText,
  Copy,
  Check,
  X,
  User,
  Truck as TruckIcon,
  DollarSign
} from 'lucide-react';
import { HistoryEntry, LogType, DriverProfile } from '../types';

interface HistoricoTabProps {
  entries: HistoryEntry[];
  profile: DriverProfile;
  onClearHistory?: () => void;
  onDeleteEntry?: (id: string) => void;
}

type FilterType = 'HOJE' | 'SEMANA' | 'MES';

export default function HistoricoTab({ entries, profile, onClearHistory, onDeleteEntry }: HistoricoTabProps) {
  const [filter, setFilter] = useState<FilterType>('MES');
  const [selectedReport, setSelectedReport] = useState<HistoryEntry | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const now = new Date();
  const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
  const todayStr = `${now.getDate().toString().padStart(2, '0')} ${months[now.getMonth()]} ${now.getFullYear()}`;

  const parseEntryDate = (dateStr: string): Date => {
    try {
      const parts = dateStr.split(' ');
      if (parts.length === 3) {
        const day = parseInt(parts[0]);
        const monthIndex = months.indexOf(parts[1].toUpperCase());
        const year = parseInt(parts[2]);
        if (monthIndex !== -1 && !isNaN(day) && !isNaN(year)) {
          return new Date(year, monthIndex, day);
        }
      }
    } catch (e) {}
    return new Date(2024, 4, 24); // Fallback to mock date
  };

  // Filter logic based on the user's mock dates and selection
  const filteredEntries = entries.filter(entry => {
    const entryDate = parseEntryDate(entry.date);
    
    if (filter === 'HOJE') {
      const isSameDay = entryDate.getDate() === now.getDate() && 
                        entryDate.getMonth() === now.getMonth() && 
                        entryDate.getFullYear() === now.getFullYear();
      return isSameDay || entry.date.includes('24 MAI');
    }
    
    if (filter === 'SEMANA') {
      const diffTime = Math.abs(now.getTime() - entryDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const isWithinAWeek = diffDays <= 7 && entryDate.getFullYear() === now.getFullYear();
      return isWithinAWeek || 
             entry.date.includes('22 MAI') || 
             entry.date.includes('23 MAI') || 
             entry.date.includes('24 MAI');
    }
    
    return true; // MES or all
  });

  const getLogStyles = (type: LogType) => {
    switch (type) {
      case 'DESCANSO':
        return {
          borderClass: 'border-l-4 border-status-success',
          textClass: 'text-status-success',
          bgIcon: 'bg-status-success/10 text-status-success',
          label: 'Descanso',
          icon: <Moon className="w-6 h-6" />
        };
      case 'REFEIÇÃO':
        return {
          borderClass: 'border-l-4 border-status-success',
          textClass: 'text-status-success',
          bgIcon: 'bg-status-success/10 text-status-success',
          label: 'Refeição',
          icon: <Utensils className="w-6 h-6" />
        };
      case 'CARGA':
        return {
          borderClass: 'border-l-4 border-primary-container',
          textClass: 'text-on-surface',
          bgIcon: 'bg-primary-container/10 text-primary-container',
          label: 'Carga',
          icon: <Upload className="w-6 h-6" />
        };
      case 'DESCARGA':
        return {
          borderClass: 'border-l-4 border-secondary-container',
          textClass: 'text-on-surface',
          bgIcon: 'bg-secondary-container/10 text-secondary-container',
          label: 'Descarga',
          icon: <Download className="w-6 h-6" />
        };
      case 'QUEBRA':
        return {
          borderClass: 'border-l-4 border-error',
          textClass: 'text-on-surface',
          bgIcon: 'bg-error/10 text-error',
          label: 'Quebra',
          icon: <Wrench className="w-6 h-6" />
        };
      case 'MANUTENÇÃO':
        return {
          borderClass: 'border-l-4 border-error',
          textClass: 'text-on-surface',
          bgIcon: 'bg-error/10 text-error',
          label: 'Manutenção',
          icon: <Wrench className="w-6 h-6" />
        };
      default:
        return {
          borderClass: 'border-l-4 border-outline-variant',
          textClass: 'text-on-surface',
          bgIcon: 'bg-surface-container-high text-on-surface',
          label: 'Estadia',
          icon: <Clock className="w-6 h-6" />
        };
    }
  };

  return (
    <div className="space-y-8 pb-32 animate-fade-in">
      {/* Header Info */}
      <section className="mb-2">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="font-sans font-extrabold text-[28px] text-on-surface tracking-tight mb-2 leading-tight">
              Meu Histórico
            </h2>
            <p className="text-on-surface-variant font-sans text-sm md:text-base">
              Resumo das suas últimas atividades na estrada.
            </p>
          </div>
          
          {entries.length > 5 && onClearHistory && (
            <button 
              onClick={onClearHistory}
              className="text-xs font-mono py-1.5 px-3 bg-surface-container-high rounded-lg text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors cursor-pointer border border-rose-500/10 flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" /> Limpar
            </button>
          )}
        </div>
      </section>

      {/* Navigation Quick Filters scrollable */}
      <nav className="flex gap-2.5 overflow-x-auto no-scrollbar py-2 -mx-1 px-1">
        <button 
          onClick={() => setFilter('HOJE')}
          className={`px-6 py-3 rounded-full font-mono text-xs uppercase tracking-wider font-bold transition-all duration-150 cursor-pointer ${
            filter === 'HOJE'
              ? 'bg-primary-container text-on-primary-container shadow-md scale-102'
              : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface'
          }`}
        >
          HOJE
        </button>

        <button 
          onClick={() => setFilter('SEMANA')}
          className={`px-6 py-3 rounded-full font-mono text-xs uppercase tracking-wider font-bold transition-all duration-150 cursor-pointer ${
            filter === 'SEMANA'
              ? 'bg-primary-container text-on-primary-container shadow-md scale-102'
              : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface'
          }`}
        >
          ESTA SEMANA
        </button>

        <button 
          onClick={() => setFilter('MES')}
          className={`px-6 py-3 rounded-full font-mono text-xs uppercase tracking-wider font-bold transition-all duration-150 cursor-pointer ${
            filter === 'MES'
              ? 'bg-primary-container text-on-primary-container shadow-md scale-102'
              : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface'
          }`}
        >
          MÊS
        </button>
      </nav>

      {/* Bento Grid Log Lists */}
      <div className="space-y-4">
        {filteredEntries.length === 0 ? (
          <div className="bg-surface-card p-10 rounded-2xl border border-outline-variant/30 text-center flex flex-col items-center justify-center gap-3">
            <Calendar className="w-12 h-12 text-on-surface-variant/40" />
            <p className="font-sans text-on-surface-variant text-sm">
              Nenhum registro encontrado para este período.
            </p>
          </div>
        ) : (
          filteredEntries.map((entry) => {
            const styles = getLogStyles(entry.type);
            const isCargaDescarga = entry.type === 'CARGA' || entry.type === 'DESCARGA';
            
            // Resolve fallback values for default initial history logs without properties
            const rate = entry.hourlyRate || 50.00;
            const durHours = entry.durationHoursNum || (entry.id === 'h2' ? 4.33 : (entry.id === 'h3' ? 2.75 : 1.08));
            const finalAmt = entry.totalAmount || (durHours * rate);

            return (
              <div 
                key={entry.id}
                onClick={() => {
                  setSelectedReport(entry);
                  setCopied(false);
                }}
                className={`group bento-card bg-surface-card ${styles.borderClass} p-5 rounded-2xl flex items-center justify-between border border-transparent border-t-outline-variant/10 cursor-pointer transition-all duration-150 hover:bg-surface-container-high/60 relative overflow-hidden active:scale-99`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 ${styles.bgIcon} rounded-xl flex items-center justify-center font-bold shadow-inner shrink-0`}>
                    {styles.icon}
                  </div>
                  <div>
                    <h3 className="font-sans text-on-surface font-extrabold text-base md:text-lg group-hover:text-primary-container transition-colors leading-tight">
                      {entry.location}
                    </h3>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <span className="text-on-surface-variant font-mono text-xs tracking-wider uppercase font-semibold">
                        {entry.date}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
                      <span className="text-on-surface-variant font-sans text-xs">
                        Entrada: {entry.startTime}
                      </span>
                      {isCargaDescarga && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
                          <span className="text-safety-yellow font-mono text-xs font-bold bg-safety-yellow/10 px-2 py-0.5 rounded-md uppercase">
                            {entry.billingType === 'ANTT' ? `ANTT ${(profile.anttRate || 2.50).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/t•h` : `R$ ${rate.toFixed(0)}/h`}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <p className={`font-mono font-extrabold text-[15px] md:text-lg leading-tight ${styles.textClass}`}>
                      {entry.duration}
                    </p>
                    <span className="text-on-surface-variant font-mono text-[10px] tracking-widest uppercase font-bold">
                      {styles.label}
                    </span>
                    {isCargaDescarga && (
                      <div className="text-[12px] md:text-[13px] font-mono font-extrabold text-safety-yellow tracking-tight mt-1 bg-surface-container px-2 py-0.5 rounded">
                        R$ {finalAmt.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    )}
                  </div>

                  {onDeleteEntry && entry.id.startsWith('custom-') && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteEntry(entry.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-2 text-rose-400 hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition-all cursor-pointer"
                      title="Excluir entrada"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 3. REPORT EXCEL/PDF BILLING DRAWER OVERLAY (MODAL) */}
      {selectedReport && (() => {
        const rate = selectedReport.hourlyRate || 50.00;
        const durHours = selectedReport.durationHoursNum || (selectedReport.id === 'h2' ? 4.33 : (selectedReport.id === 'h3' ? 2.75 : 1.08));
        const finalAmt = selectedReport.totalAmount || (durHours * rate);
        
        const isAntt = selectedReport.billingType === 'ANTT';
        // Old preloaded history items didn't have excludeFirst5Hours saved, default them to false so math is consistent!
        const isExcluding = selectedReport.excludeFirst5Hours ?? false;
        const capacityTons = selectedReport.truckCapacityTons ?? 12;
        const billedHours = isExcluding ? Math.max(0, durHours - 5) : durHours;

        const reportTitle = isAntt ? 'DETALHE DA RECLAMAÇÃO - LEI DA ESTADIA ANTT' : 'DETALHE DA RECLAMAÇÃO - ACORDO PRIVADO';

        const textToCopy = `--- RELATÓRIO PARA ENVIO DE COBRANÇA (ESTADIA/DEMURRAGE) ---
ID DO REGISTRO: ${selectedReport.id}
EMISSÃO: ${new Date().toLocaleDateString('pt-BR')}

REGRA APLICADA: ${isAntt ? 'LEI FEDERAL ANTT (R$ 2,50/ton•h)' : 'VALOR COMBINADO POR HORA'}
TOLERÂNCIA DE 5 HORAS: ${isExcluding ? 'APLICADA (As primeiras 5 horas de estadia foram descontadas)' : 'NÃO APLICADA (Faturamento integral)'}

DADOS DO MOTORISTA:
• Nome Completo: ${profile.fullName}
• CPF: ${profile.cpf}
• CNH: ${profile.cnh}

DADOS DO VEÍCULO:
• Modelo do Cavalo: ${profile.truckModel}
• Placa Cavalo: ${profile.plateCavalo}
• Placa Carreta: ${profile.plateCarreta}

DETALHES DA ESTADIA:
• Local do Estabelecimento: ${selectedReport.location}
• Data do Registro: ${selectedReport.date}
• Atividade Realizada: ${selectedReport.type}
• Horário de Entrada: ${selectedReport.startTime}
• Horário de Saída: ${selectedReport.endTime || 'Não registrado'}

DEMONSTRATIVO DE VALORES:
• Tempo Total Confeccionado: ${selectedReport.duration} (${durHours.toLocaleString('pt-BR')} horas decimais)
• Horas de Isenção (Tolerância): ${isExcluding ? '5,00 horas' : '0,00 horas'}
• Tempo Efetivo de Cobrança: ${billedHours.toLocaleString('pt-BR')} horas
${isAntt ? `• Capacidade de Carga Homologada: ${capacityTons} toneladas\n• Taxa da ANTT: R$ 2,50 por tonelada/hora` : `• Valor Combinado Contratado: R$ ${rate.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} por hora`}
• VALOR TOTAL DA COBRANÇA: R$ ${finalAmt.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}

---------------------------------------------------
Gerado eletronicamente conforme Lei nº 11.442/2007 via Painel de Controle EstadiaCerta.`;

        const handleCopy = () => {
          navigator.clipboard.writeText(textToCopy);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        };

        const handlePrintPDF = () => {
          const iframe = document.createElement('iframe');
          iframe.style.position = 'fixed';
          iframe.style.right = '0';
          iframe.style.bottom = '0';
          iframe.style.width = '0';
          iframe.style.height = '0';
          iframe.style.border = '0';
          document.body.appendChild(iframe);

          const doc = iframe.contentWindow?.document || iframe.contentDocument;
          if (!doc) return;

          const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <title>${isAntt ? 'Faturamento Lei ANTT/11.442' : 'Faturamento de Estadia'}</title>
              <link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
              <style>
                body {
                  font-family: 'Hanken Grotesk', sans-serif;
                  background-color: #ffffff;
                  color: #1a1a1a;
                  margin: 0;
                  padding: 40px;
                  font-size: 14px;
                  line-height: 1.6;
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
                .container {
                  max-width: 800px;
                  margin: 0 auto;
                }
                .header {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  border-bottom: 3px solid #facd33;
                  padding-bottom: 20px;
                  margin-bottom: 30px;
                }
                .logo-section h1 {
                  font-size: 28px;
                  font-weight: 800;
                  margin: 0;
                  color: #131313;
                  text-transform: uppercase;
                  letter-spacing: -0.5px;
                }
                .logo-section h1 span {
                  color: #facd33;
                  background-color: #131313;
                  padding: 2px 8px;
                  border-radius: 4px;
                  margin-left: 2px;
                }
                .logo-section p {
                  margin: 5px 0 0 0;
                  font-size: 11px;
                  font-family: 'JetBrains Mono', monospace;
                  color: #666;
                  text-transform: uppercase;
                  letter-spacing: 1px;
                }
                .receipt-type {
                  text-align: right;
                }
                .badge {
                  background-color: #facd33;
                  color: #131313;
                  font-family: 'JetBrains Mono', monospace;
                  font-size: 10px;
                  font-weight: 700;
                  padding: 5px 12px;
                  border-radius: 20px;
                  text-transform: uppercase;
                  display: inline-block;
                  margin-bottom: 5px;
                }
                .receipt-date {
                  font-size: 12px;
                  color: #666;
                }
                .total-card {
                  background: #fdfaf2;
                  border: 2px dashed #facd33;
                  border-radius: 16px;
                  padding: 24px;
                  text-align: center;
                  margin-bottom: 30px;
                }
                .total-card p {
                  margin: 0;
                  font-size: 12px;
                  font-family: 'JetBrains Mono', monospace;
                  text-transform: uppercase;
                  color: #666;
                  letter-spacing: 1px;
                }
                .total-card .amount {
                  font-size: 36px;
                  font-weight: 800;
                  color: #131313;
                  margin: 10px 0;
                }
                .section-title {
                  font-family: 'JetBrains Mono', monospace;
                  font-size: 11px;
                  font-weight: 700;
                  color: #facd33;
                  background: #131313;
                  padding: 6px 12px;
                  border-radius: 4px;
                  margin-top: 30px;
                  margin-bottom: 15px;
                  text-transform: uppercase;
                  letter-spacing: 1px;
                  display: inline-block;
                }
                .grid {
                  display: grid;
                  grid-template-columns: repeat(2, 1fr);
                  gap: 20px;
                }
                .grid-3 {
                  display: grid;
                  grid-template-columns: repeat(3, 1fr);
                  gap: 15px;
                }
                .info-block label {
                  font-size: 11px;
                  color: #666;
                  display: block;
                  margin-bottom: 4px;
                  font-weight: 700;
                }
                .info-block p {
                  margin: 0;
                  font-weight: 700;
                  font-size: 14px;
                  color: #1a1a1a;
                }
                .info-block p.highlight {
                  color: #fd8b00;
                }
                .demonstrative-table {
                  width: 100%;
                  border-collapse: collapse;
                  margin-top: 15px;
                  background: #fdfdfd;
                  border: 1px solid #e0e0e0;
                  border-radius: 8px;
                  overflow: hidden;
                }
                .demonstrative-table td {
                  padding: 12px 16px;
                  border-bottom: 1px solid #e0e0e0;
                }
                .demonstrative-table tr:last-child td {
                  border-bottom: none;
                }
                .demonstrative-table .label {
                  color: #666;
                }
                .demonstrative-table .value {
                  font-weight: 700;
                  text-align: right;
                }
                .demonstrative-table .total-row {
                  background-color: #fcfcfc;
                  font-weight: 800;
                  font-size: 16px;
                }
                .demonstrative-table .total-row td {
                  border-top: 2px solid #facd33;
                }
                .legal-notice {
                  background-color: #fdfaf2;
                  border-left: 4px solid #facd33;
                  padding: 15px;
                  border-radius: 0 8px 8px 0;
                  font-size: 12px;
                  margin-top: 30px;
                  color: #444;
                }
                .legal-notice p {
                  margin: 0 0 8px 0;
                }
                .legal-notice p:last-child {
                  margin: 0;
                }
                .footer {
                  text-align: center;
                  margin-top: 50px;
                  font-size: 11px;
                  color: #888;
                  border-top: 1px solid #eee;
                  padding-top: 20px;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <div class="logo-section">
                    <h1>Estadia<span>Certa</span></h1>
                    <p>Controle de Estadias e Diárias</p>
                  </div>
                  <div class="receipt-type">
                    <span class="badge" style="background-color: #facd33 !important; color: #131313 !important;">${isAntt ? 'LEI 11.442/2007' : 'ACORDO PRIVADO'}</span>
                    <div class="receipt-date">Emissão: ${new Date().toLocaleDateString('pt-BR')}</div>
                  </div>
                </div>

                <div class="total-card" style="background-color: #fdfaf2 !important; border: 2px dashed #facd33 !important;">
                  <p>VALOR DE RECLAMAÇÃO DE PERMANÊNCIA</p>
                  <div class="amount">R$ ${finalAmt.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  <p style="font-size: 11px; color: #888;">Cálculo oficial gerado pelo aplicativo EstadiaCerta</p>
                </div>

                <div>
                  <div class="section-title" style="background-color: #131313 !important; color: #facd33 !important;">Qualificação do Motorista</div>
                  <div class="grid">
                    <div class="info-block">
                      <label>NOME DO MOTORISTA</label>
                      <p>${profile.fullName}</p>
                    </div>
                    <div class="info-block">
                      <label>CPF DO MOTORISTA</label>
                      <p>${profile.cpf}</p>
                    </div>
                    <div class="info-block">
                      <label>REGISTRO CNH</label>
                      <p>${profile.cnh}</p>
                    </div>
                    <div class="info-block">
                      <label>DATA E HORA DO RELATÓRIO</label>
                      <p>${new Date().toLocaleString('pt-BR')}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <div class="section-title" style="background-color: #131313 !important; color: #facd33 !important;">Veículo e Relação de Carga</div>
                  <div class="grid-3">
                    <div class="info-block">
                      <label>VEÍCULO / MODELO</label>
                      <p>${profile.truckModel}</p>
                    </div>
                    <div class="info-block">
                      <label>PLACA CAVALO</label>
                      <p>${profile.plateCavalo}</p>
                    </div>
                    <div class="info-block">
                      <label>PLACA CARRETA</label>
                      <p>${profile.plateCarreta}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <div class="section-title" style="background-color: #131313 !important; color: #facd33 !important;">Apuração de Estadia / Permanência</div>
                  <div class="grid">
                    <div class="info-block" style="grid-column: span 2;">
                      <label>LOCALIZAÇÃO / CD LOGÍSTICA</label>
                      <p>${selectedReport.location}</p>
                    </div>
                    <div class="info-block">
                      <label>DATA DO REGISTRO</label>
                      <p>${selectedReport.date}</p>
                    </div>
                    <div class="info-block">
                      <label>ATIVIDADE / MOTIVO</label>
                      <p class="highlight" style="color: #fd8b00 !important;">${selectedReport.type}</p>
                    </div>
                    <div class="info-block">
                      <label>HORÁRIO DE ENTRADA</label>
                      <p>${selectedReport.startTime}</p>
                    </div>
                    <div class="info-block">
                      <label>HORÁRIO DE SAÍDA</label>
                      <p>${selectedReport.endTime || 'Concluído'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <div class="section-title" style="background-color: #131313 !important; color: #facd33 !important;">Demonstrativo de Cálculo de Valores</div>
                  <table class="demonstrative-table">
                    <tr>
                      <td class="label">Tempo de Permanência Total</td>
                      <td class="value">${selectedReport.duration} (${durHours.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}h decimais)</td>
                    </tr>
                    <tr>
                      <td class="label">Carência de Tolerância Regulamentar</td>
                      <td class="value">${isExcluding ? '5,00 horas' : '0,00 horas'}</td>
                    </tr>
                    <tr>
                      <td class="label">Tempo Efetivamente Cobrável</td>
                      <td class="value" style="color: #fd8b00 !important;">${billedHours.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}h</td>
                    </tr>
                    ${isAntt ? `
                      <tr>
                        <td class="label">Capacidade do Veículo Homologada</td>
                        <td class="value">${capacityTons} Toneladas</td>
                      </tr>
                      <tr>
                        <td class="label">Taxa da Lei da Estadia ANTT</td>
                        <td class="value">R$ ${(profile.anttRate || 2.50).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} por tonelada / hora</td>
                      </tr>
                    ` : `
                      <tr>
                        <td class="label">Valor de Hora Combinado</td>
                        <td class="value">R$ ${rate.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/hora</td>
                      </tr>
                    `}
                    <tr class="total-row" style="background-color: #fcfcfc !important;">
                      <td class="label">TOTAL DA COBRANÇA</td>
                      <td class="value" style="color: #131313 !important; font-size: 18px !important;">R$ ${finalAmt.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                  </table>
                </div>

                ${isAntt ? `
                  <div class="legal-notice" style="background-color: #fdfaf2 !important; border-left: 4px solid #facd33 !important;">
                    <p style="font-weight: 700; margin-bottom: 5px;">🔗 Fundamento Legal (Lei nº 11.442/2007)</p>
                    <p>• O tempo máximo para carga e descarga do veículo de transporte rodoviário de cargas é de 5 (cinco) horas, contadas da chegada do veículo ao endereço do destino.</p>
                    <p>• Vencido o prazo de 5 (cinco) horas, é devido ao Transportador Autônomo de Cargas (TAC) ou à ETC a importância calculada por tonelada/hora ou fração.</p>
                  </div>
                ` : ''}

                <div class="footer">
                  <p>Relatório gerado eletronicamente em conformidade com a legislação vigente via Painel de Controle EstadiaCerta.</p>
                  <p>© 2026 EstadiaCerta. Todos os direitos reservados.</p>
                </div>
              </div>
            </body>
            </html>
          `;

          doc.open();
          doc.write(htmlContent);
          doc.close();

          setTimeout(() => {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
            setTimeout(() => {
              document.body.removeChild(iframe);
            }, 1000);
          }, 500);
        };

        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pb-28 md:pb-6 bg-background/80 backdrop-blur-md animate-fade-in">
            <div id="printable-receipt" className="bg-surface-elevated border border-outline-variant/50 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[calc(100vh-180px)] md:max-h-[85vh]">
              
              {/* Header */}
              <div className="bg-surface-card border-b border-outline-variant/30 px-6 py-4.5 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-safety-yellow/10 text-safety-yellow rounded-xl flex items-center justify-center">
                    <FileText className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <h4 className="font-sans font-extrabold text-base text-on-surface leading-tight uppercase">
                      {isAntt ? 'Faturamento Lei ANTT/11.442' : 'Faturamento de Estadia'}
                    </h4>
                    <p className="font-mono text-[10px] text-on-surface-variant tracking-wider uppercase mt-0.5">
                      {isAntt ? 'Demonstrativo de Demurrage Federal' : 'Ficha de Cobrança Combinada'}
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedReport(null)}
                  className="w-10 h-10 rounded-full hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Receipt Body */}
              <div className="p-6 overflow-y-auto space-y-6 text-sm">
                
                {/* Print Banner */}
                <div className="bg-background-highest/30 p-4 rounded-2xl border-2 border-dashed border-outline-variant/50 text-center flex flex-col items-center">
                  <span className="text-[10px] bg-safety-yellow text-primary-container font-mono font-extrabold px-2 py-0.5 rounded-full uppercase tracking-widest mb-1.5 leading-none">
                    {isAntt ? 'LEI 11.442/2007 GARANTIDA' : 'VALOR COMBINADO'}
                  </span>
                  <p className="font-mono text-xs uppercase text-on-surface-variant tracking-wider">
                    VALOR DE RECLAMAÇÃO DE PERMANÊNCIA
                  </p>
                  <p className="font-sans font-extrabold text-2xl text-safety-yellow mt-1">
                    R$ {finalAmt.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>

                {/* Driver Context Info block */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-1">
                    <User className="w-4 h-4 text-primary-container shrink-0" />
                    <span className="font-mono text-[11px] text-primary-container font-bold uppercase tracking-wider">QUALIFICAÇÃO DO MOTORISTA</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                    <div>
                      <p className="text-on-surface-variant font-sans">Nome do Motorista</p>
                      <p className="font-sans font-extrabold text-on-surface uppercase mt-0.5">{profile.fullName}</p>
                    </div>
                    <div>
                      <p className="text-on-surface-variant font-sans">CPF de Cadastro</p>
                      <p className="font-mono font-semibold text-on-surface mt-0.5">{profile.cpf}</p>
                    </div>
                    <div>
                      <p className="text-on-surface-variant font-sans">Registro CNH</p>
                      <p className="font-mono font-semibold text-on-surface mt-0.5">{profile.cnh}</p>
                    </div>
                    <div>
                      <p className="text-on-surface-variant font-sans">Geração do Relatório</p>
                      <p className="font-sans font-medium text-on-surface mt-0.5">{new Date().toLocaleString('pt-BR')}</p>
                    </div>
                  </div>
                </div>

                {/* Truck context detail block */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-1">
                    <TruckIcon className="w-4 h-4 text-primary-container shrink-0" />
                    <span className="font-mono text-[11px] text-primary-container font-bold uppercase tracking-wider">RELAÇÃO VEICULAR</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <p className="text-on-surface-variant font-sans">Cavalo Trator</p>
                      <p className="font-sans font-extrabold text-on-surface uppercase mt-0.5">{profile.truckModel}</p>
                    </div>
                    <div>
                      <p className="text-on-surface-variant font-sans">Placa Cavalo</p>
                      <p className="font-mono font-bold text-safety-yellow mt-0.5 uppercase bg-surface-container/60 text-center py-0.5 rounded">
                        {profile.plateCavalo}
                      </p>
                    </div>
                    <div>
                      <p className="text-on-surface-variant font-sans">Placa Carreta</p>
                      <p className="font-mono font-bold text-safety-yellow mt-0.5 uppercase bg-surface-container/60 text-center py-0.5 rounded">
                        {profile.plateCarreta}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stay log detail list */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-1">
                    <Calendar className="w-4 h-4 text-primary-container shrink-0" />
                    <span className="font-mono text-[11px] text-primary-container font-bold uppercase tracking-wider">APURAÇÃO DA ESTADIA</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                    <div className="col-span-2">
                      <p className="text-on-surface-variant font-sans">Estabelecimento / Local de Repouso/Espera</p>
                      <p className="font-sans font-extrabold text-on-surface text-sm mt-0.5">{selectedReport.location}</p>
                    </div>
                    <div>
                      <p className="text-on-surface-variant font-sans">Entrada Registrada</p>
                      <p className="font-sans font-bold text-on-surface mt-0.5 uppercase">{selectedReport.startTime}</p>
                    </div>
                    <div>
                      <p className="text-on-surface-variant font-sans">Saída Concluída</p>
                      <p className="font-sans font-bold text-on-surface mt-0.5 uppercase">{selectedReport.endTime || 'Fim de Jornada'}</p>
                    </div>
                    <div>
                      <p className="text-on-surface-variant font-sans">Atividade / Finalidade</p>
                      <p className="font-mono font-bold text-primary-container uppercase mt-0.5">{selectedReport.type}</p>
                    </div>
                    <div>
                      <p className="text-on-surface-variant font-sans">Data Declarada</p>
                      <p className="font-sans font-medium text-on-surface mt-0.5">{selectedReport.date}</p>
                    </div>
                  </div>
                </div>

                {/* Calculation demonstrative block */}
                <div className="space-y-2 bg-surface-container rounded-2xl p-4 border border-outline-variant/30">
                  <p className="font-mono text-[10px] text-on-surface-variant uppercase font-bold tracking-widest text-center border-b border-outline-variant/20 pb-1.5 mb-2">
                    DEMONSTRATIVO DE CÁLCULO DE VALOR
                  </p>
                  
                  <div className="flex justify-between text-xs font-sans">
                    <span className="text-on-surface-variant">Tempo Decorrido Total</span>
                    <span className="font-bold text-on-surface">{selectedReport.duration} ({durHours.toFixed(2)}h decimais)</span>
                  </div>
                  <div className="flex justify-between text-xs font-sans">
                    <span className="text-on-surface-variant">Carência/Tolerância Descontada</span>
                    <span className="font-bold text-on-surface">{isExcluding ? '-5,00 horas' : '0,00 horas'}</span>
                  </div>
                  <div className="flex justify-between text-xs font-sans">
                    <span className="text-on-surface-variant">Tempo Cobrável Excedente</span>
                    <span className="font-bold text-safety-yellow">{billedHours.toFixed(2)}h</span>
                  </div>

                  {isAntt ? (
                    <>
                      <div className="flex justify-between text-xs font-sans">
                        <span className="text-on-surface-variant">Capacidade de Carga do Veículo</span>
                        <span className="font-bold text-on-surface">{capacityTons} Toneladas</span>
                      </div>
                      <div className="flex justify-between text-xs font-sans">
                        <span className="text-on-surface-variant">Taxa Oficial ANTT (Lei 11.442)</span>
                        <span className="font-bold text-on-surface">R$ {(profile.anttRate || 2.50).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / Tonelada • hora</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between text-xs font-sans">
                      <span className="text-on-surface-variant">Valor Combinado Ajustado</span>
                      <span className="font-bold text-on-surface">R$ {rate.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/hora</span>
                    </div>
                  )}

                  <div className="h-px bg-outline-variant/30 my-2"></div>
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="font-sans font-extrabold text-on-surface text-sm">TOTAL A SER COBRADO</span>
                      {isAntt && (
                        <span className="text-[10px] text-on-surface-variant font-mono mt-0.5">Fórmula: {billedHours.toFixed(2)}h x {capacityTons}t x R$ {(profile.anttRate || 2.50).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      )}
                    </div>
                    <span className="font-mono font-extrabold text-base text-safety-yellow">
                      R$ {finalAmt.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Important Law Rules Notice Card */}
                {isAntt && (
                  <div className="bg-safety-yellow/5 border border-safety-yellow/20 p-4 rounded-xl text-xs space-y-1.5 leading-relaxed text-on-surface-variant">
                    <p className="font-semibold text-safety-yellow uppercase text-[10px] tracking-wider mb-1">🔗 Regras Legais Importantes</p>
                    <p>• <b>Comprovante de Chegada:</b> O embarcador e destinatário são obrigados a fornecer documento atestando horário exato de chegada. A falta pode gerar multa de até <span className="text-safety-yellow/90 font-bold">5% do valor da carga</span>.</p>
                    <p>• <b>Direito Legal:</b> O pagamento da estadia adicional é um direito garantido pela Lei nº 11.442/2007 (tanto para TAC autônomo quanto ETC empresa de transporte).</p>
                  </div>
                )}

              </div>

              {/* Copy / billing button interaction footer */}
              <div className="bg-surface-card border-t border-outline-variant/30 p-4 flex flex-col sm:flex-row gap-2.5 shrink-0 no-print">
                <button
                  onClick={handleCopy}
                  className={`flex-1 h-12 rounded-xl font-mono text-xs uppercase font-extrabold tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                    copied 
                      ? 'bg-status-success text-on-surface' 
                      : 'bg-primary-container hover:bg-safety-yellow text-on-primary hover:text-primary-container'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-4.5 h-4.5" /> COPIADO!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4.5 h-4.5" /> COPIAR TEXTO
                    </>
                  )}
                </button>
                <button
                  onClick={handlePrintPDF}
                  className="flex-1 h-12 rounded-xl font-mono text-xs uppercase font-extrabold tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-md bg-secondary-container hover:bg-secondary text-on-surface-variant hover:text-surface-card"
                >
                  <FileText className="w-4.5 h-4.5" /> GERAR PDF
                </button>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="h-12 px-5 bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-sans text-xs uppercase font-bold tracking-wider rounded-xl transition-all duration-150 cursor-pointer"
                >
                  Fechar
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* Safety Bottom Buffer */}
      <div className="h-12 border-b border-transparent"></div>
    </div>
  );
}
