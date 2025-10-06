// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const productosRoutes = require('./routes/productos');
const authenticateToken = require('./middleware/auth');

const app = express();

app.use(cors());
app.use(express.json());

// Rutas públicas
app.use('/', authRoutes);

// Rutas protegidas
app.use('/productos', authenticateToken, productosRoutes);

// Raíz
app.get('/', (req, res) => res.send('API Inventario Inteligente funcionando 🚀'));

// Arranque
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
