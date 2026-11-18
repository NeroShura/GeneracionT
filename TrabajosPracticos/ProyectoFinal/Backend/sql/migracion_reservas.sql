
USE sistema_reservas;

ALTER TABLE reservas
ADD COLUMN fecha_expiracion DATETIME(3) NULL
AFTER fecha_cancelacion;

CREATE INDEX idx_reserva_expiracion
ON reservas (estado, fecha_expiracion);
