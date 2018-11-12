const express = require('express');
const middleware = require('../middleware/authentication')
const Medico = require('../models/medico');
const doctorRoutes = express();

/**
* Obetener todos los medicos
*/
doctorRoutes.get('/', (req, res) => {
    const desde = req.query.desde || 0;
    Medico.find({})
    .populate('usuario', 'nombre email')
    .populate('hospital')
    .skip(Number(desde))
	.limit(5)
	.exec((err, medicos) => {
		if (err) {
			return res.status(500).json({
				ok: false,
				mensaje: 'Error cargando medicos',
				erros: err
			});
        }
        Medico.count({}, (err, conteo) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando medicos',
                    erros: err
                });
            }
            res.status(200).json({
                ok: true,
                total: conteo,
                medicos
            }); 
        });
		
	})
});

/**
 * Actualizar medico
 */
doctorRoutes.put('/:id', middleware.verficarToken, (req, res) => {
	const id = req.params.id;
	const body = req.body;

	Medico.findById(id, (err, medico) => {

		if (err) {
			return res.status(500).json({
				ok: false,
				mensaje: 'Error al buscar medico',
				erros: err
			});
		}

		if (!medico) {
			return res.status(400).json({
				ok: false,
				mensaje: `El medico con el id ${id} no existe`,
				erros: { message: 'No existe medico con ese Id' }
			});
		}

        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;
		medico.save((err, medicoGuardado) => {
			if (err) {
				return res.status(400).json({
					ok: false,
					mensaje: 'Error al actualizar medico',
					erros: err
				});
			}
			res.status(200).json({
				ok: true,
				medico: medicoGuardado
			});

		});

	});
});

/**
* Crear un nuevo medico
*/
doctorRoutes.post('/', middleware.verficarToken, (req, res) => {
	const body = req.body;
	const medico = new Medico({
		nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id,
        hospital: body.hospital
	});

	medico.save((err, nuevoMedico) => {
		if (err) {
			return res.status(400).json({
				ok: false,
				mensaje: 'Error al Crear medico',
				erros: err
			});
		}
		res.status(201).json({
			ok: true,
			medico: nuevoMedico
		});
	});

});

/**
* Borrar un medico
*/
doctorRoutes.delete('/:id', middleware.verficarToken, (req, res) => {
	const id = req.params.id;
	Medico.findByIdAndRemove( id, (err, medicoBorrado) => {
		if (err) {
			return res.status(500).json({
				ok: false,
				message: 'Error al borrar medico',
				errors: err 
			});
		}

		if (!medicoBorrado) {
			return res.status(400).json({
				ok: false,
				message: `No existe usaurio con ese id ${id}`,
				errors: {message: `No existe usaurio con ese id ${id}`} 
			});
		}

		res.status(200).json({
			ok: true,
			medico: medicoBorrado
		});

	});
});

module.exports = doctorRoutes;