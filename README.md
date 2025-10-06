# 🧠 API REST - Inventario Inteligente

Este proyecto es una **API REST segura** desarrollada con **Node.js**, **Express** y **MySQL (WAMP)**, que permite:

- 🔐 Registrar usuarios y autenticarlos mediante **JWT (JSON Web Token)**.
- 📦 Gestionar productos: listar, obtener detalles y actualizar stock.
- 🖥️ Conectarse a una base de datos MySQL local.
- 📱 Servir como backend para una app móvil o web de inventario inteligente.

---

## ⚙️ Requisitos previos

Antes de iniciar, asegúrate de tener instalados los siguientes componentes:

- 🟢 **Node.js** (versión >= 18)  
- 📦 **npm** (versión >= 9)  
- 🖥️ **WAMP Server** (incluye MySQL y phpMyAdmin)  
- 📬 **Postman** (opcional, para probar los endpoints de la API)

---

## 🛠️ Configuración inicial y ejecución de la API

Sigue estos pasos para configurar y ejecutar la API en tu máquina local:

1. 🔵 **Inicia WAMP Server** y verifica que el ícono esté verde.  
2. 🖥️ **Abre phpMyAdmin** en http://localhost/phpmyadmin y crea la base de datos:  
CREATE DATABASE inventario_db;  
3. 📂 Abre la terminal dentro de la carpeta del proyecto y ejecuta:  
npm install  
4. 🚀 Inicia el servidor:  
Modo desarrollo: npm run dev

El servidor se ejecutará en: http://localhost:3000

---

## 🚀 Prueba de la API con Postman

1️⃣ **Crear usuario**  
URL: POST http://localhost:3000/register  
Body JSON: { "username": "admin", "password": "123456" }  
Respuesta esperada: { "message": "Usuario creado exitosamente" }

2️⃣ **Iniciar sesión**  
URL: POST http://localhost:3000/login  
Body JSON: { "username": "admin", "password": "123456" }  
Respuesta esperada: { "token": "eyJhbGciOi..." }  
Copia el token para las siguientes solicitudes.

3️⃣ **Ver todos los productos**  
URL: GET http://localhost:3000/productos  
Header: Authorization: Bearer <token>  
Respuesta esperada: [ { "id": 1, "nombre": "Tornillo M4", "descripcion": "Tornillo de 4mm", "cantidad": 100 }, { "id": 2, "nombre": "Tuerca M4", "descripcion": "Tuerca de 4mm", "cantidad": 150 }, ... ]

4️⃣ **Ver producto por ID**  
URL: GET http://localhost:3000/productos/1  
Header: Authorization: Bearer <token>  
Respuesta esperada: { "id": 1, "nombre": "Tornillo M4", "descripcion": "Tornillo de 4mm", "cantidad": 100 }

5️⃣ **Actualizar stock**  
URL: PUT http://localhost:3000/productos/1  
Header: Authorization: Bearer <token>  
Body JSON: { "delta": -1 }  
Respuesta esperada: { "id": "1", "cantidad": 99 }

---
