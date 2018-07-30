// Requires
const express = require('express');
const mongoose = require('mongoose');

// Inicializar varioables
const app = express();

// Conexion a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/HospitalDB',
 (err, res) => {
    if (err) throw err;
    console.info('Base de datos: \x1b[32m%s\x1b[0m' , 'online');
})

// Rutas
app.get('/', (req, res, next) => {
    res.status(200).json({
        ok: true,
        mensaje: 'Peticion realizada correctamente, Hola Mundo'
    });
})

// Escuchar peticiones
app.listen(3000, () => {
    console.info('Express server puerto 3000: \x1b[32m%s\x1b[0m' , 'online');
});
