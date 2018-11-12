const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const routes = express();
const Hospital = require('../models/hospital');
const Medico = require('../models/medico');
const Usuario = require('../models/usuario');

routes.use(fileUpload());
routes.put('/:tipo/:id', (req, res, next) => {

    const tipo = req.params.tipo;
    const id = req.params.id;
    const tiposValidos = ['usuarios', 'medicos', 'hospitales'];

    if(!tiposValidos.includes(tipo, 0)) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de colección no valido',
            erros: {message: 'El tipo de coleccion debe ser'+ tiposValidos.join(', ') }
        });
    }


    if (Object.keys(req.files).length == 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Error no selecciona un archivo',
            erros: {message: 'Debe seleccionar una imagen'}
        });
    }

    const archivo = req.files.imagen;
    const divisionNombre = archivo.name.split('.');
    const extension = divisionNombre[divisionNombre.length - 1];
    const extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (!extensionesValidas.includes(extension, 0)) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extension de archivo no valido',
            erros: {message: 'La extensiones validas son '+ extensionesValidas.join(', ')}
        });
    }

    const nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;
    const path = `./uploads/${tipo}/${nombreArchivo}`;


    archivo.mv(path, (err) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover el archivo',
                erros: {message: 'Error al mover el archivo'}
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);
      });
})

function subirPorTipo(tipo, id, nombreArchivo, res) {

    if (tipo === 'usuarios') {
        Usuario.findById(id, (err, usuario) => {
            const pathAntiguo = './uploads/usuarios/' + usuario.img;
            if (fs.existsSync(pathAntiguo)) {
                fs.unlink(pathAntiguo);
            }
            usuario.img = nombreArchivo;
            usuario.save((err, usuarioActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada'
                });
            });
        });
    }

    if (tipo === 'medicos') {
        Medico.findById(id, (err, medico) => {
            const pathAntiguo = './uploads/medicos/' + medico.img;
            if (fs.existsSync(pathAntiguo)) {
                fs.unlink(pathAntiguo);
            }
            medico.img = nombreArchivo;
            medico.save((err, medicoActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico actualizada'
                });
            });
        });
    }

    if (tipo === 'hospitales') {
        Hospital.findById(id, (err, hospital) => {
            const pathAntiguo = './uploads/hopitales/' + hospital.img;
            if (fs.existsSync(pathAntiguo)) {
                fs.unlink(pathAntiguo);
            }
            hospital.img = nombreArchivo;
            hospital.save((err, hospitalActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital actualizada'
                });
            });
        });
    }

    
}

module.exports = routes;


