-- ==========================================
-- DDL para criação das tabelas no Supabase (PostgreSQL)
-- Aplicativo: EstadiaCerta
-- ==========================================

-- Habilitar extensão para geração de UUID se necessário
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABELA DE MOTORISTAS
CREATE TABLE IF NOT EXISTS motoristas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome_completo VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    cnh VARCHAR(12) UNIQUE NOT NULL,
    modelo_caminhao VARCHAR(100) NOT NULL,
    placa_cavalo VARCHAR(8) NOT NULL,
    placa_carreta VARCHAR(8) NOT NULL,
    is_online BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices otimizados para motoristas
CREATE INDEX IF NOT EXISTS idx_motoristas_cpf ON motoristas(cpf);

-- 2. TABELA DE ESTADIAS (Controle de Permanência)
CREATE TABLE IF NOT EXISTS estadias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    motorista_id UUID NOT NULL REFERENCES motoristas(id) ON DELETE CASCADE,
    localizacao VARCHAR(255) NOT NULL,
    motivo VARCHAR(50) NOT NULL, -- Ex: CARGA, DESCARGA, DESCANSO, MANUTENÇÃO
    tipo_cobranca VARCHAR(20) NOT NULL, -- Ex: COMBINADO, ANTT
    valor_hora_combinado NUMERIC(10, 2) DEFAULT 0.00,
    capacidade_veiculo_ton NUMERIC(6, 2) DEFAULT 0.00,
    desconsiderar_5h BOOLEAN DEFAULT TRUE,
    checkin_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    checkout_timestamp TIMESTAMP WITH TIME ZONE,
    duracao_segundos INTEGER,
    valor_total NUMERIC(10, 2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'EM_ANDAMENTO', -- Ex: EM_ANDAMENTO, CONCLUIDA
    latitude NUMERIC(10, 8),
    longitude NUMERIC(11, 8),
    odometro NUMERIC(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices otimizados para consultas de auditoria na estrada
CREATE INDEX IF NOT EXISTS idx_estadias_motorista_id ON estadias(motorista_id);
CREATE INDEX IF NOT EXISTS idx_estadias_status ON estadias(status);
CREATE INDEX IF NOT EXISTS idx_estadias_checkin ON estadias(checkin_timestamp);

-- Trigger para atualizar a coluna updated_at na tabela de motoristas
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER set_timestamp_motoristas
BEFORE UPDATE ON motoristas
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();
