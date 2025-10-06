// routes/productos.js
const express = require('express');
const router = express.Router();
const { all, get, run } = require('../db');

// Listar productos
router.get('/', async (req, res) => {
  try {
    const productos = await all('SELECT * FROM productos');
    res.json(productos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Obtener un producto por ID
router.get('/:id', async (req, res) => {
  try {
    const producto = await get('SELECT * FROM productos WHERE id = ?', [req.params.id]);
    if (!producto) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json(producto);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Actualizar cantidad en stock
router.put('/:id', async (req, res) => {
  try {
    const { cantidad, delta } = req.body;
    const id = req.params.id;

    const producto = await get('SELECT cantidad FROM productos WHERE id = ?', [id]);
    if (!producto) return res.status(404).json({ message: 'Producto no encontrado' });

    let nuevaCantidad = producto.cantidad;
    if (typeof delta === 'number') nuevaCantidad += delta;
    else if (typeof cantidad === 'number') nuevaCantidad = cantidad;

    if (nuevaCantidad < 0) nuevaCantidad = 0;

    await run('UPDATE productos SET cantidad = ? WHERE id = ?', [nuevaCantidad, id]);
    res.json({ id, cantidad: nuevaCantidad });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

module.exports = router;
