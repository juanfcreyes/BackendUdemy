const express = require('express');
const bcrypt = require('bcrypt');
const middleware = require('../middleware/authentication')
const Usuario = require('../models/usuario');
const userRoutes = express();

/**
* Obetener todo los usuarios
*/
userRoutes.get('/', (req, res) => {
	Usuario.find({}, 'nombre email img role')
	.exec((err, usuarios) => {
		if (err) {
			return res.status(500).json({
				ok: false,
				mensaje: 'Error Cargando Usuarios',
				erros: err
			});
		}
		res.status(200).json({
			ok: true,
			usuarios: usuarios
		});
	})
});

/**
 * Actualizar usuario
 */
userRoutes.put('/:id', middleware.verficarToken, (req, res) => {
	const id = req.params.id;
	const body = req.body;

	Usuario.findById(id, (err, usuario) => {

		if (err) {
			return res.status(500).json({
				ok: false,
				mensaje: 'Error al buscar usuario',
				erros: err
			});
		}

		if (!usuario) {
			return res.status(400).json({
				ok: false,
				mensaje: `El usuario con el id ${id} no existe`,
				erros: { message: 'No existe el usaurio con ese Id' }
			});
		}

		usuario.nombre = body.nombre;
		usuario.email = body.email;
		usuario.role = body.role;

		usuario.save((err, usuarioGuardado) => {
			if (err) {
				return res.status(400).json({
					ok: false,
					mensaje: 'Error al actualizar usuario',
					erros: err
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
userRoutes.post('/', middleware.verficarToken, (req, res) => {
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
				mensaje: 'Error al Crear Usuario',
				erros: err
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
userRoutes.delete('/:id', middleware.verficarToken, (req, res) => {
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