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
    const regex = new RegExp(busqueda, 'i');
    let promesa = undefined;

    switch (tabla) {
        case 'usuario':
            promesa = buscarUsuarios(regex)
            break;
        case 'medico':
            promesa = buscarMedicos(regex)
            break;
        case 'hospital':
            promesa = buscarHospitales(regex) 
            break;
        default:
            res.status(400).json({
                ok: false,
                message: 'Coleccion no válida para la búsqueda'
            });
    }

    promesa.then(respuesta => {
        res.status(200).json({
            ok: true,
            [tabla]: respuesta
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
        Usuario.find({}, 'nombre email role')
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

module.exports = busquedaRoutes;