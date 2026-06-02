/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, ChangeEvent, useEffect } from 'react';
import { 
  User, 
  CreditCard, 
  FileText, 
  Truck, 
  Layers, 
  LogOut, 
  Check, 
  Edit3,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Camera as CameraIcon,
  Coins,
  Scale,
  ShieldCheck
} from 'lucide-react';
import { DriverProfile, HistoryEntry } from '../types';

interface PerfilTabProps {
  profile: DriverProfile;
  history: HistoryEntry[];
  onUpdateProfile: (updated: Partial<DriverProfile>) => void;
  onImportHistory: (imported: HistoryEntry[]) => void;
  onLogout: () => void;
}

export default function PerfilTab({ profile, history, onUpdateProfile, onImportHistory, onLogout }: PerfilTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(profile.fullName);
  const [editedCpf, setEditedCpf] = useState(profile.cpf);
  const [editedCnh, setEditedCnh] = useState(profile.cnh);
  const [editedAvatarUrl, setEditedAvatarUrl] = useState(profile.avatarUrl);
  const [editedTruckModel, setEditedTruckModel] = useState(profile.truckModel);
  const [editedTruckImageUrl, setEditedTruckImageUrl] = useState(profile.truckImageUrl);
  const [editedPlateCavalo, setEditedPlateCavalo] = useState(profile.plateCavalo);
  const [editedPlateCarreta, setEditedPlateCarreta] = useState(profile.plateCarreta);
  const [editedAnttRate, setEditedAnttRate] = useState(profile.anttRate || 2.50);

  // Sync state if profile changes due to backup import
  useEffect(() => {
    setEditedName(profile.fullName);
    setEditedCpf(profile.cpf);
    setEditedCnh(profile.cnh);
    setEditedAvatarUrl(profile.avatarUrl);
    setEditedTruckModel(profile.truckModel);
    setEditedTruckImageUrl(profile.truckImageUrl);
    setEditedPlateCavalo(profile.plateCavalo);
    setEditedPlateCarreta(profile.plateCarreta);
    setEditedAnttRate(profile.anttRate || 2.50);
  }, [profile]);

  const handleSave = () => {
    onUpdateProfile({
      fullName: editedName,
      cpf: editedCpf,
      cnh: editedCnh,
      avatarUrl: editedAvatarUrl,
      truckModel: editedTruckModel,
      truckImageUrl: editedTruckImageUrl,
      plateCavalo: editedPlateCavalo,
      plateCarreta: editedPlateCarreta,
      anttRate: editedAnttRate,
      name: editedName.split(' ')[0].toUpperCase() + (editedName.split(' ')[1] ? ' ' + editedName.split(' ')[1].toUpperCase() : '')
    });
    setIsEditing(false);
  };

  const handleAvatarUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setEditedAvatarUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleTruckImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setEditedTruckImageUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleExportBackup = () => {
    const backupData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      profile: profile,
      history: history
    };

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(backupData, null, 2)
    )}`;
    
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute(
      'download',
      `EstadiaCerta_Backup_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportBackup = (e: ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const files = e.target.files;
    if (!files || files.length === 0) return;

    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && Array.isArray(parsed.history)) {
          onImportHistory(parsed.history);
          if (parsed.profile) {
            onUpdateProfile(parsed.profile);
          }
        } else {
          alert('Arquivo de backup inválido ou corrompido.');
        }
      } catch (err) {
        alert('Erro ao ler arquivo de backup.');
      }
    };
    fileReader.readAsText(files[0]);
  };

  return (
    <div className="space-y-8 pb-32 animate-fade-in">
      {/* SECTION 0: AVATAR HEADER */}
      <div className="flex flex-col items-center justify-center py-4 gap-3 bg-surface-card rounded-2xl p-6 border border-outline-variant/30 shadow-md">
        <div className="relative group">
          <div className="absolute inset-0 rounded-full bg-primary-container/10 scale-105 animate-pulse"></div>
          <div className="w-28 h-28 rounded-full border-4 border-primary-container overflow-hidden shadow-lg relative">
            <img 
              referrerPolicy="no-referrer"
              src={editedAvatarUrl} 
              alt={profile.fullName} 
              className="w-full h-full object-cover"
            />
            {isEditing && (
              <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center cursor-pointer text-white transition-opacity active:scale-95 duration-100">
                <CameraIcon className="w-6 h-6 text-primary-container animate-pulse" />
                <span className="text-[9px] font-mono uppercase tracking-wider mt-1 font-bold">Alterar</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>
        {isEditing && (
          <div className="w-full max-w-xs flex flex-col gap-1 text-center">
            <label className="font-mono text-[10px] text-on-surface-variant tracking-wider uppercase font-bold">
              URL da Foto de Perfil (Opcional)
            </label>
            <input
              type="text"
              value={editedAvatarUrl}
              onChange={(e) => setEditedAvatarUrl(e.target.value)}
              placeholder="Ou cole o link de uma imagem da internet"
              className="bg-background border border-outline-variant/60 rounded px-2.5 py-1 text-on-surface font-sans text-xs focus:outline-none focus:border-safety-yellow w-full text-center"
            />
          </div>
        )}
      </div>

      {/* SECTION 1: DADOS DO MOTORISTA */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h2 className="font-mono text-xs text-on-surface-variant font-bold tracking-widest uppercase">
            DADOS DO MOTORISTA
          </h2>
          <button 
            onClick={() => {
              if (isEditing) {
                handleSave();
              } else {
                setIsEditing(true);
              }
            }}
            className="text-xs font-mono text-primary-container flex items-center gap-1.5 hover:text-safety-yellow transition-colors cursor-pointer"
          >
            {isEditing ? (
              <>
                <Check className="w-3.5 h-3.5" /> Salvar
              </>
            ) : (
              <>
                <Edit3 className="w-3.5 h-3.5" /> Editar Dados
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Full Name Card (Spans 2 columns) */}
          <div className="col-span-2 bg-surface-card p-6 border-l-[3px] border-safety-yellow flex flex-col gap-1.5 rounded-r-xl shadow-md">
            <span className="text-on-surface-variant text-[11px] font-mono tracking-wider font-extrabold uppercase flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-safety-yellow" /> NOME COMPLETO
            </span>
            {isEditing ? (
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="bg-background border border-outline-variant/60 rounded px-2.5 py-1 text-on-surface font-sans text-base font-bold focus:outline-none focus:border-safety-yellow w-full"
              />
            ) : (
              <span className="font-sans text-[20px] font-extrabold text-on-surface">
                {profile.fullName}
              </span>
            )}
          </div>

          {/* CPF Card */}
          <div className="bg-surface-card p-5 border-l-2 border-outline-variant flex flex-col gap-1.5 rounded-r-xl shadow-sm">
            <span className="text-on-surface-variant text-[11px] font-mono tracking-wider font-extrabold uppercase flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-on-surface-variant" /> CPF
            </span>
            {isEditing ? (
              <input
                type="text"
                value={editedCpf}
                onChange={(e) => setEditedCpf(e.target.value)}
                className="bg-background border border-outline-variant/60 rounded px-2 py-0.5 text-on-surface font-mono text-sm font-bold focus:outline-none focus:border-safety-yellow w-full"
              />
            ) : (
              <span className="font-mono text-[15px] font-bold text-on-surface tracking-wide">
                {profile.cpf}
              </span>
            )}
          </div>

          {/* CNH Card */}
          <div className="bg-surface-card p-5 border-l-2 border-outline-variant flex flex-col gap-1.5 rounded-r-xl shadow-sm">
            <span className="text-on-surface-variant text-[11px] font-mono tracking-wider font-extrabold uppercase flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-on-surface-variant" /> CNH ({'E'})
            </span>
            {isEditing ? (
              <input
                type="text"
                value={editedCnh}
                onChange={(e) => setEditedCnh(e.target.value)}
                className="bg-background border border-outline-variant/60 rounded px-2 py-0.5 text-on-surface font-mono text-sm font-bold focus:outline-none focus:border-safety-yellow w-full"
              />
            ) : (
              <span className="font-mono text-[15px] font-bold text-on-surface tracking-wide">
                {profile.cnh}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 2: VEHICLE DATA */}
      <section className="space-y-4">
        <h2 className="font-mono text-xs text-on-surface-variant font-bold tracking-widest uppercase px-1">
          DADOS DO VEÍCULO
        </h2>

        <div className="space-y-3">
          {/* Truck Model Hero Card */}
          <div className="relative w-full h-48 bg-surface-container-highest rounded-2xl overflow-hidden group shadow-lg border border-outline-variant/10">
            <img 
              referrerPolicy="no-referrer"
              src={editedTruckImageUrl}
              alt={profile.truckModel} 
              className="w-full h-full object-cover opacity-60 group-hover:scale-103 transition-transform duration-700"
            />
            {/* Dark vignette overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-6">
              <span className="text-safety-yellow font-mono text-[11px] tracking-widest font-extrabold uppercase">
                MODELO ATUAL
              </span>
              {isEditing ? (
                <div className="w-full space-y-1.5 mt-1">
                  <input
                    type="text"
                    value={editedTruckModel}
                    onChange={(e) => setEditedTruckModel(e.target.value)}
                    placeholder="Modelo do Caminhão"
                    className="bg-black/45 border border-outline-variant/85 rounded px-3 py-1 text-white font-sans text-base font-extrabold focus:outline-none focus:border-safety-yellow w-full"
                  />
                  <div className="flex gap-2">
                    <label className="flex-1 h-9 bg-black/50 border border-outline-variant/80 rounded text-white font-mono text-[10px] font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer hover:bg-surface-container-high transition-all active:scale-95 text-center leading-[34px]">
                      <CameraIcon className="w-3.5 h-3.5 text-secondary animate-pulse" /> Tirar Foto / Upload Caminhão
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleTruckImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <h3 className="font-sans font-extrabold text-[28px] text-white tracking-tight">
                  {profile.truckModel}
                </h3>
              )}
            </div>
          </div>

          {/* Plates Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Placa do Cavalo */}
            <div className="bg-surface-card p-5 border-l-2 border-secondary-container flex flex-col gap-1.5 rounded-r-xl shadow-sm">
              <span className="text-on-surface-variant text-[11px] font-mono tracking-wider font-extrabold uppercase flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-secondary" /> PLACA CAVALO
              </span>
              {isEditing ? (
                <input
                  type="text"
                  value={editedPlateCavalo}
                  onChange={(e) => setEditedPlateCavalo(e.target.value)}
                  className="bg-background border border-outline-variant/60 rounded px-2 py-0.5 text-on-surface font-sans font-bold text-base focus:outline-none focus:border-safety-yellow w-full"
                />
              ) : (
                <span className="font-sans text-lg font-bold text-on-surface">
                  {profile.plateCavalo}
                </span>
              )}
            </div>

            {/* Placa da Carreta */}
            <div className="bg-surface-card p-5 border-l-2 border-secondary-container flex flex-col gap-1.5 rounded-r-xl shadow-sm">
              <span className="text-on-surface-variant text-[11px] font-mono tracking-wider font-extrabold uppercase flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-secondary" /> PLACA CARRETA
              </span>
              {isEditing ? (
                <input
                  type="text"
                  value={editedPlateCarreta}
                  onChange={(e) => setEditedPlateCarreta(e.target.value)}
                  className="bg-background border border-outline-variant/60 rounded px-2 py-0.5 text-on-surface font-sans font-bold text-base focus:outline-none focus:border-safety-yellow w-full"
                />
              ) : (
                <span className="font-sans text-lg font-bold text-on-surface">
                  {profile.plateCarreta}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>
      {/* SECTION 3: CONFIGURAÇÃO DE LEI / VALOR DA HORA */}
      <section className="space-y-4">
        <h2 className="font-mono text-xs text-on-surface-variant font-bold tracking-widest uppercase px-1">
          LEGISLAÇÃO E VALOR DA HORA (LEI 11.442)
        </h2>
        <div className="bg-surface-card p-6 rounded-2xl border border-outline-variant/30 shadow-md space-y-4">
          <div className="flex items-start gap-4">
            <div className="bg-primary-container/10 p-3 rounded-xl text-safety-yellow shrink-0">
              <Scale className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-sans font-bold text-base text-on-surface">
                Configuração do Valor da Hora de Estadia
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                De acordo com o Art. 5º-A da Lei nº 11.442/2007 (ANTT), o valor devido por hora excedente de carga/descarga é calculado com base na capacidade do veículo por tonelada/hora.
              </p>
            </div>
          </div>
          
          <div className="bg-background/50 border border-outline-variant/30 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Coins className="w-5 h-5 text-safety-yellow shrink-0" />
              <div>
                <span className="text-[10px] text-on-surface-variant font-mono uppercase tracking-wider block font-bold">
                  VALOR ATUAL POR TONELADA/HORA
                </span>
                <span className="font-sans text-xs text-on-surface-variant leading-none">
                  Definido em Lei (ANTT)
                </span>
              </div>
            </div>
            
            <div className="w-full sm:w-auto flex items-center gap-2">
              <span className="font-sans text-lg font-bold text-on-surface select-none">R$</span>
              {isEditing ? (
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={editedAnttRate}
                  onChange={(e) => setEditedAnttRate(parseFloat(e.target.value) || 0)}
                  className="bg-background border-2 border-safety-yellow/60 rounded px-3 py-1.5 text-on-surface font-mono font-extrabold text-lg focus:outline-none focus:border-safety-yellow w-28 text-center"
                />
              ) : (
                <span className="font-mono text-2xl font-extrabold text-safety-yellow">
                  {(profile.anttRate || 2.50).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: DATA SAFETY & BACKUP */}
      <section className="space-y-4">
        <h2 className="font-mono text-xs text-on-surface-variant font-bold tracking-widest uppercase px-1">
          SEGURANÇA E BACKUP
        </h2>
        <div className="bg-surface-card p-6 rounded-2xl border border-outline-variant/30 shadow-md space-y-4">
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Seu aplicativo é 100% offline-first. Para evitar a perda do seu histórico ao trocar de celular ou reinstalar o aplicativo, exporte um backup regularmente.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleExportBackup}
              className="h-12 bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/50 text-on-surface hover:text-white rounded-xl font-mono text-xs uppercase font-extrabold tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <DownloadIcon className="w-4 h-4 text-safety-yellow" /> Exportar Backup
            </button>
            <label
              className="h-12 bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/50 text-on-surface hover:text-white rounded-xl font-mono text-xs uppercase font-extrabold tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 text-center leading-[46px]"
            >
              <UploadIcon className="w-4 h-4 text-secondary" /> Importar Backup
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </section>

      {/* SECTION 5: PRIVACIDADE & LGPD */}
      <section className="space-y-4">
        <h2 className="font-mono text-xs text-on-surface-variant font-bold tracking-widest uppercase px-1">
          PRIVACIDADE E LGPD (LEI 13.709)
        </h2>
        <div className="bg-surface-card p-6 rounded-2xl border-l-[3px] border-status-success rounded-r-2xl border border-outline-variant/30 shadow-md space-y-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-status-success shrink-0" />
            <h3 className="font-sans font-bold text-base text-on-surface">
              Segurança e Privacidade Garantidas
            </h3>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Este aplicativo foi desenvolvido sob o princípio de <strong>Privacy by Design (Privacidade desde a concepção)</strong>. 
            Todos os seus dados pessoais (nome, CPF, CNH, placas, fotos e coordenadas de localização GPS) são armazenados 
            <strong> 100% localmente</strong> no seu próprio dispositivo e nunca são enviados para servidores externos ou terceiros.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-[11px] font-mono text-on-surface-variant uppercase">
            <div className="bg-background/40 p-3 rounded-lg border border-outline-variant/20 flex flex-col gap-1">
              <span className="font-bold text-status-success">✓ CONTROLE TOTAL</span>
              Você tem direito de alterar ou apagar todos os dados a qualquer momento.
            </div>
            <div className="bg-background/40 p-3 rounded-lg border border-outline-variant/20 flex flex-col gap-1">
              <span className="font-bold text-status-success">✓ ZERO VAZAMENTO</span>
              Nenhum dado trafega na internet ou em nuvens corporativas.
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: ACTIONS */}
      <section className="pt-4">
        <button 
          onClick={onLogout}
          className="w-full h-16 border-2 border-status-critical text-status-critical hover:bg-status-critical/10 active:scale-98 transition-all duration-150 flex items-center justify-center gap-3 rounded-xl uppercase tracking-wider font-mono text-xs font-bold shadow-md cursor-pointer"
        >
          <LogOut className="w-4.5 h-4.5" />
          Sair da Conta
        </button>
      </section>

      {/* Aesthetic visual indicator line */}
      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-safety-yellow/20 to-transparent pt-2"></div>
    </div>
  );
}
