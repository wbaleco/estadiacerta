"""
Módulo de Endpoint Serverless de Check-In.
Mantém a persistência dos registros de estadia dos motoristas no Supabase.
"""

import os
import logging
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field
import psycopg2
from psycopg2.extras import RealDictCursor
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

# Configuração de Logs
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("EstadiaCertaBackend")

app = FastAPI(title="EstadiaCerta Serverless Backend")

# Habilitar CORS nas rotas locais/internas
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Definição do Esquema de Validação com Pydantic
class CheckInRequest(BaseModel):
    motorista_id: str = Field(..., description="UUID do motorista solicitante")
    localizacao: str = Field(..., max_length=255, description="Localização do estabelecimento")
    motivo: str = Field("CARGA", description="Motivo da estadia: CARGA, DESCARGA, DESCANSO, MANUTENÇÃO")
    tipo_cobranca: str = Field("COMBINADO", description="Estratégia de cálculo: COMBINADO, ANTT")
    valor_hora_combinado: Optional[float] = Field(0.0, description="Preço por hora combinado")
    capacidade_veiculo_ton: Optional[float] = Field(0.0, description="Capacidade de carga do veículo")
    desconsiderar_5h: Optional[bool] = Field(True, description="Ignorar as primeiras 5h conforme lei")
    latitude: Optional[float] = Field(None, description="Latitude capturada pelo GPS")
    longitude: Optional[float] = Field(None, description="Longitude capturada pelo GPS")
    odometro: Optional[float] = Field(None, description="Odômetro informado no check-in")

def get_db_connection():
    """Retorna uma conexão estável com o banco Supabase usando variáveis de ambiente."""
    db_url = os.environ.get("DATABASE_URL")
    if not db_url:
        logger.error("A variável de ambiente DATABASE_URL não está configurada.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro de configuração no servidor de banco de dados."
        )
    try:
        conn = psycopg2.connect(db_url, cursor_factory=RealDictCursor)
        return conn
    except Exception as e:
        logger.error(f"Falha ao conectar com o PostgreSQL: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Banco de dados temporariamente indisponível."
        )

@app.post("/api/checkin", status_code=status.HTTP_201_CREATED)
async def check_in(payload: CheckInRequest):
    """
    Registra um novo evento de Check-In de estadia.
    Valida a existência do motorista e grava os dados com precisão.
    """
    logger.info(f"Processando solicitação de Check-In para motorista: {payload.motorista_id}")

    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            # 1. Verificar se o motorista existe cadastrado na base
            cur.execute("SELECT id FROM motoristas WHERE id = %s", (payload.motorista_id,))
            motorista = cur.fetchone()
            if not motorista:
                logger.warning(f"Tentativa de check-in com motorista inexistente: {payload.motorista_id}")
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Motorista não encontrado na base de dados."
                )

            # 2. Fechar qualquer estadia 'EM_ANDAMENTO' anterior para o mesmo motorista (Prevenção de conflitos)
            cur.execute(
                """
                UPDATE estadias 
                SET status = 'CONCLUIDA', checkout_timestamp = NOW() 
                WHERE motorista_id = %s AND status = 'EM_ANDAMENTO'
                """,
                (payload.motorista_id,)
            )

            # 3. Gravar o novo registro de Check-In
            insert_query = """
                INSERT INTO estadias (
                    motorista_id, localizacao, motivo, tipo_cobranca, 
                    valor_hora_combinado, capacidade_veiculo_ton, desconsiderar_5h, 
                    checkin_timestamp, status, latitude, longitude, odometro
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, NOW(), 'EM_ANDAMENTO', %s, %s, %s)
                RETURNING id, checkin_timestamp;
            """
            cur.execute(
                insert_query,
                (
                    payload.motorista_id, payload.localizacao, payload.motivo, payload.tipo_cobranca,
                    payload.valor_hora_combinado, payload.capacidade_veiculo_ton, payload.desconsiderar_5h,
                    payload.latitude, payload.longitude, payload.odometro
                )
            )
            new_entry = cur.fetchone()
            conn.commit()

            logger.info(f"Check-In registrado com sucesso. ID Estadia: {new_entry['id']}")
            return {
                "success": True,
                "message": "Check-In registrado com sucesso.",
                "estadia_id": str(new_entry["id"]),
                "checkin_timestamp": new_entry["checkin_timestamp"].isoformat()
            }

    except HTTPException:
        # Repassa exceções HTTP declaradas sem alteração
        raise
    except Exception as e:
        conn.rollback()
        logger.error(f"Erro inesperado durante processamento do Check-In: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ocorreu um erro interno ao salvar seu registro de estadia."
        )
    finally:
        conn.close()
