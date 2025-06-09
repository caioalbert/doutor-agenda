-- Criar o tipo enum para status de agendamento
CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'canceled', 'completed');

-- Adicionar a coluna de status à tabela de agendamentos
ALTER TABLE appointments ADD COLUMN status appointment_status NOT NULL DEFAULT 'pending';

-- Adicionar a coluna de motivo de cancelamento à tabela de agendamentos
ALTER TABLE appointments ADD COLUMN cancellation_reason TEXT;
