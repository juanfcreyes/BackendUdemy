const express = require('express');
const middleware = require('../middleware/authentication')
const Hospital = require('../models/hospital');
const hospitalRoutes = express();
const responderConError = require('../utils/backend.util').responderConError;


/**
* Obetener todos los hospitales
*/
hospitalRoutes.get('/', (req, res) => {
	const desde = req.query.desde || 0;
	Hospital.find({})
		.populate('usuario', 'nombre email')
		.skip(Number(desde))
		.limit(5)
		.exec((err, hospitales) => {
			if (err) {
				return res.status(500).json({
					ok: false,
					mensaje: 'Error cargando hospitales',
					erros: err
				});
			}
			Hospital.countDocuments({}, (err, conteo) => {
				if (err) {
					return res.status(500).json({
						ok: false,
						mensaje: 'Error cargando hospitales',
						erros: err
					});
				}
				res.status(200).json({
					ok: true,
					total: conteo,
					hospitales
				});
			});

		})
});

/**
 * Actualizar hospital
 */
hospitalRoutes.put('/:id', middleware.verficarToken, (req, res) => {
	const id = req.params.id;
	const body = req.body;

	Hospital.findById(id, (err, hospital) => {

		if (err) {
			return res.status(500).json({
				ok: false,
				mensaje: 'Error al buscar hospital',
				erros: err
			});
		}

		if (!hospital) {
			return res.status(400).json({
				ok: false,
				mensaje: `El hospital con el id ${id} no existe`,
				erros: { message: 'No existe hospital con ese Id' }
			});
		}

		hospital.nombre = body.nombre;
		hospital.usuario = req.usuario._id;
		hospital.save((err, hospitalGuardado) => {
			if (err) {
				return res.status(400).json({
					ok: false,
					mensaje: 'Error al actualizar hospital',
					erros: err
				});
			}
			res.status(200).json({
				ok: true,
				hospital: hospitalGuardado
			});

		});

	});
});

/**
* Crear un nuevo hospital
*/
hospitalRoutes.post('/', middleware.verficarToken, (req, res) => {
	const body = req.body;
	const hospital = new Hospital({
		nombre: body.nombre,
		img: body.img,
		usuario: req.usuario._id
	});

	hospital.save((err, nuevoHospital) => {
		if (err) {
			return res.status(400).json({
				ok: false,
				mensaje: 'Error al Crear hospital',
				erros: err
			});
		}
		res.status(201).json({
			ok: true,
			hospital: nuevoHospital
		});
	});

});

/**
* Borrar un hospital
*/
hospitalRoutes.delete('/:id', middleware.verficarToken, (req, res) => {
	const id = req.params.id;
	Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
		if (err) {
			return res.status(500).json({
				ok: false,
				message: 'Error al borrar hospital',
				errors: err
			});
		}

		if (!hospitalBorrado) {
			return res.status(400).json({
				ok: false,
				message: `No existe hospital con ese id ${id}`,
				errors: { message: `No existe hospital con ese id ${id}` }
			});
		}

		res.status(200).json({
			ok: true,
			hospital: hospitalBorrado
		});

	});
});

/**
 * Buscar un hospital por su id
 */
hospitalRoutes.get('/:id', (req, res) => {
	var id = req.params.id;
	Hospital.findById(id)
		.populate('usuario', 'nombre img email')
		.exec((err, hospital) => {
			if (err) {
				return responderConError(res, err,'Error al buscar hospital',500);
			}
			if (!hospital) {
				responderConError(res, {message: 'No existe un hospital con ese ID'},
					`El hospital con el id ${id}no existe`,400);
			}
			res.status(200).json({
				ok: true,
				hospital: hospital
			});
		})
});
module.exports = hospitalRoutes;