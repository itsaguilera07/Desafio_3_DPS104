CREATE DATABASE inventario_db;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
);

CREATE TABLE productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  cantidad INT NOT NULL DEFAULT 0
);

INSERT INTO productos (nombre, descripcion, cantidad) VALUES
('Tornillo M4', 'Tornillo de 4mm', 100),
('Taladro 18V', 'Taladro inalámbrico con batería recargable', 10),
('Batería AA', 'Pila alcalina de larga duración', 200),
('Martillo de carpintero', 'Martillo con mango de madera', 25),
('Destornillador Philips', 'Destornillador punta cruz mediano', 40),
('Llave inglesa', 'Llave ajustable de acero inoxidable', 15),
('Cinta métrica 5m', 'Cinta métrica retráctil de 5 metros', 30),
('Sierra manual', 'Sierra de corte fino para madera', 12),
('Brocas mixtas', 'Juego de brocas para metal y madera (10 piezas)', 18),
('Alicate universal', 'Alicate de acero con mango ergonómico', 20),
('Clavos 2”', 'Caja con 100 unidades de clavos de 2 pulgadas', 50),
('Guantes de seguridad', 'Guantes de trabajo recubiertos de goma', 60),
('Casco de protección', 'Casco industrial color amarillo', 14),
('Lentes de seguridad', 'Lentes transparentes antiempañantes', 22),
('Mascarilla N95', 'Mascarilla con filtro de partículas finas', 100),
('Pintura blanca 1L', 'Pintura acrílica blanca para interiores', 35),
('Rodillo de pintura', 'Rodillo de espuma con mango de plástico', 27),
('Brocha 2”', 'Brocha de cerdas suaves para acabados', 45),
('Cinta aislante', 'Cinta eléctrica negra 10m', 75),
('Multímetro digital', 'Medidor de voltaje y resistencia portátil', 8),
('Cable eléctrico 10m', 'Cable de cobre calibre 14', 20),
('Pegamento industrial', 'Adhesivo de contacto de alta resistencia', 33),
('Lija fina', 'Papel de lija grano 220', 55),
('Tubo PVC 1”', 'Tubo de PVC para conducción de agua', 40),
('Conector PVC 1”', 'Codo conector de PVC de 1 pulgada', 80);

