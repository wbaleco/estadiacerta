/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TabType = 'inicio' | 'historico' | 'perfil';

export type LogType = 'CARGA' | 'DESCARGA' | 'DESCANSO' | 'QUEBRA' | 'REFEIÇÃO' | 'MANUTENÇÃO';

export interface HistoryEntry {
  id: string;
  location: string;
  date: string; // e.g., "24 MAI 2024"
  duration: string; // e.g., "09h 15min"
  type: LogType;
  startTime: string; // e.g., "08:30" or "23 MAI, 08:30"
  endTime?: string; // e.g., "12:50" or "23 MAI, 12:50"
  durationHoursNum: number; // e.g., 4.33
  hourlyRate: number; // e.g., 50.00 (Valor da Hora)
  totalAmount: number; // e.g., 216.50 (Valor Final Coberto)
  notes?: string;
  billingType?: 'COMBINADO' | 'ANTT';
  truckCapacityTons?: number;
  excludeFirst5Hours?: boolean;
}

export interface ActiveJourney {
  checkedIn: boolean;
  startTime: string; // Display string
  startTimestamp: number; // millisecond timestamp
  location: string; // Custom input location
  reason: LogType;
  hourlyRate: number; // Hourly rate for charging
  billingType?: 'COMBINADO' | 'ANTT';
  truckCapacityTons?: number;
  excludeFirst5Hours?: boolean;
}

export interface DriverProfile {
  name: string;
  fullName: string;
  cpf: string;
  cnh: string;
  avatarUrl: string;
  truckModel: string;
  truckImageUrl: string;
  plateCavalo: string;
  plateCarreta: string;
  isOnline: boolean;
  anttRate?: number;
}
