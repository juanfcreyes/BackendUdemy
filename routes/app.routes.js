const express = require('express');

// Inicializar varioables
const routes = express();

// Rutas
routes.get('/', (req, res, next) => {
    res.status(200).json({
        ok: true,
        mensaje: 'Peticion realizada correctamente, Hola Mundo'
    });
})

module.exports = routes;