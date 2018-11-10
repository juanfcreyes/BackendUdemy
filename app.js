// Requires
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// Inicializar varioables
const app = express();

// Body Parser 
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// Importar rutas
const appRoutes = require('./routes/app.routes');
const userRoutes = require('./routes/usuario.routes');
const loginRoutes = require('./routes/login.routes')

// Conexion a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/HospitalDB',
 (err, res) => {
    if (err) throw err;
    console.info('Base de datos: \x1b[32m%s\x1b[0m' , 'online');
})

// Rutas
app.use('/login', loginRoutes);
app.use('/usuario', userRoutes);
app.use('/', appRoutes);

// Escuchar peticiones
app.listen(3000, () => {
    console.info('Express server puerto 3000: \x1b[32m%s\x1b[0m' , 'online');
});
