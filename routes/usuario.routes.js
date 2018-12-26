const express = require('express');
const bcrypt = require('bcrypt');
const middleware = require('../middleware/authentication')
const Usuario = require('../models/usuario');
const userRoutes = express();

/**
* Obetener todo los usuarios
*/
userRoutes.get('/', (req, res) => {
	const desde = req.query.desde || 0;
	Usuario.find({}, 'nombre email img role google')
	.skip(Number(desde))
	.limit(5)
	.exec((err, usuarios) => {
		if (err) {
			return res.status(500).json({
				ok: false,
				mensaje: 'Error Cargando Usuarios',
				erros: err
			});
		}
		Usuario.countDocuments({}, (err, conteo) => {
			if (err) {
				return res.status(500).json({
					ok: false,
					mensaje: 'Error Cargando Usuarios',
					erros: err
				});
			}
			res.status(200).json({
				ok: true,
				total: conteo,
				usuarios: usuarios
			});
		});
		
	})
});

/**
 * Actualizar usuario
 */
userRoutes.put('/:id', [middleware.verficarToken, middleware.verficarAdminUsuarioActual], (req, res) => {
	const id = req.params.id;
	const body = req.body;

	Usuario.findById(id, (err, usuario) => {

		if (err) {
			return res.status(500).json({
				ok: false,
				message: 'Error al buscar usuario',
				errors: err
			});
		}

		if (!usuario) {
			return res.status(400).json({
				ok: false,
				message: `El usuario con el id ${id} no existe`,
				errors: { message: 'No existe el usaurio con ese Id' }
			});
		}

		usuario.nombre = body.nombre;
		usuario.email = body.email;
		usuario.role = body.role;

		usuario.save((err, usuarioGuardado) => {
			if (err) {
				return res.status(400).json({
					ok: false,
					message: 'Error al actualizar usuario',
					errors: err
				});
			}
			usuarioGuardado.password = ':)';
			res.status(200).json({
				ok: true,
				usuario: usuarioGuardado
			});

		});

	});
});

/**
* Crear un nuevo usuario
*/
userRoutes.post('/', (req, res) => {
	const body = req.body;
	const usuario = new Usuario({
		nombre: body.nombre,
		email: body.email,
		password: bcrypt.hashSync(body.password, 10),
		img: body.img,
		role: body.role
	});

	usuario.save((err, nuevoUsuario) => {
		if (err) {
			return res.status(400).json({
				ok: false,
				message: 'Error al Crear Usuario',
				errors: err
			});
		}
		res.status(201).json({
			ok: true,
			usuario: nuevoUsuario
		});
	});

});

/**
* Borrar un usuario
*/
userRoutes.delete('/:id',  [middleware.verficarToken, middleware.verficarAdmin], (req, res) => {
	const id = req.params.id;
	Usuario.findByIdAndRemove( id, (err, usuarioBorrado) => {
		if (err) {
			return res.status(500).json({
				ok: false,
				message: 'Error al borrar usuario',
				errors: err 
			});
		}

		if (!usuarioBorrado) {
			return res.status(400).json({
				ok: false,
				message: `No existe usaurio con ese id ${id}`,
				errors: {message: `No existe usaurio con ese id ${id}`} 
			});
		}

		res.status(200).json({
			ok: true,
			usuario: usuarioBorrado
		});

	});
});

module.exports = userRoutes;