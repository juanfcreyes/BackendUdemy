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
const loginRoutes = require('./routes/login.routes');
const userRoutes = require('./routes/usuario.routes');
const doctorRoutes = require('./routes/medico.routes');
const hospitalRoutes = require('./routes/hospital.routes');
const busquedaRoutes = require('./routes/busqueda.routes');
const uploadRoutes = require('./routes/upload.routes');
const imagenesRoutes = require('./routes/imagenes.routes');


// Conexion a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/HospitalDB',
 (err, res) => {
    if (err) throw err;
    console.info('Base de datos: \x1b[32m%s\x1b[0m' , 'online');
});

// Server index config
const serveIndex = require('serve-index');
app.use(express.static(__dirname + '/'))
app.use('/uploads', serveIndex(__dirname + '/uploads'));

// Rutas
app.use('/login', loginRoutes);
app.use('/usuario', userRoutes);
app.use('/medico', doctorRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/upload', uploadRoutes);
app.use('/imagenes',imagenesRoutes);
app.use('/', appRoutes);

// Escuchar peticiones
app.listen(3000, () => {
    console.info('Express server puerto 3000: \x1b[32m%s\x1b[0m' , 'online');
});
