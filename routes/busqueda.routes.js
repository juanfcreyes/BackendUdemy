const express = require('express');
const busquedaRoutes = express();
const Hospital = require('../models/hospital');
const Medico = require('../models/medico');
const Usuario = require('../models/usuario');

/**
 * Busqueda por tabla
 */
busquedaRoutes.get('/coleccion/:tabla/:busqueda', (req, res) => {
    const tabla = req.params.tabla;
    const busqueda = req.params.busqueda;
    const paginar = req.query.paginar || false;
    const desde = req.query.desde || 0;
    const regex = new RegExp(busqueda, 'i');
    let promesa = undefined;


    switch (tabla) {
        case 'usuarios':
            if (paginar) {
                promesa = buscarUsuariosPaginados(regex, desde);
            } else {
                promesa = buscarUsuarios(regex);
            }
            break;
        case 'medicos':
            promesa = buscarMedicos(regex);
            break;
        case 'hospitales':
            promesa = buscarHospitales(regex);
            break;
        default:
            return res.status(400).json({
                ok: false,
                message: 'Coleccion no válida para la búsqueda'
            });
    }

    promesa.then(respuesta => {
        res.status(200).json({
            ok: true,
            total: respuesta['total'] || respuesta.length,
            [tabla]: respuesta[tabla] || respuesta 
        });
    })

});



/**
 * Busqueda General
 */
busquedaRoutes.get('/todo/:busqueda', (req, res, next) => {
    const busqueda = req.params.busqueda;
    const regex = new RegExp(busqueda, 'i');

    Promise.all(
        [buscarHospitales(regex),
        buscarMedicos(regex),
        buscarUsuarios(regex)])
        .then(respuestas => {
            res.status(200).json({
                ok: true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            });
        })
});

function buscarHospitales(regex) {
    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: regex }, (err, hospitales) => {
            if (err) {
                reject('Error al cargar hospitales', err);
            } else {
                resolve(hospitales);
            }
        });
    });
}

function buscarMedicos(regex) {
    return new Promise((resolve, reject) => {
        Medico.find({ nombre: regex }, (err, medicos) => {
            if (err) {
                reject('Error al cargar medicos', err);
            } else {
                resolve(medicos);
            }
        });
    });
}

function buscarUsuarios(regex) {
    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre email role img google')
            .or([{ nombre: regex }, { email: regex }])
            .exec((err, usuarios) => {
                if (err) {
                    reject('Error al cargar usuarios', err);
                } else {
                    resolve(usuarios);
                }
            });
    });
}

function buscarUsuariosPaginados(regex, desde) {
    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre email role img google')
            .skip(Number(desde))
	        .limit(5)
            .or([{ nombre: regex }, { email: regex }])
            .exec((err, usuarios) => {
                if (err) {
                    reject('Error al cargar usuarios', err);
                } else {
                    Usuario.countDocuments({}).or([{ nombre: regex }, { email: regex }])
                    .exec((err, total) => {
                        resolve( {usuarios, total });
                    });
                }
            });

            
    });
}

module.exports = busquedaRoutes;