const jwt = require('jsonwebtoken');
const SEED = require('../config/config').SEED;

/**
 * Verificar token
 */
exports.verficarToken = function(req, res, next) {
    const token = req.query.token;
	jwt.verify(token, SEED, (err, decoded) => {
		if (err) {
			return res.status(401).json({
				ok: false,
				message: 'Token incorrecto',
				errors: err 
			});
        }
        req.usuario = decoded.usuario;
		next();
	});
}

/**
 * Verificar Admin
 */
exports.verficarAdmin = function(req, res, next) {
	const usuario = req.usuario;
	
	if (usuario.role === 'ADMIN_ROLE') {
		next();
		return;
	} else {
		return res.status(403).json({
			ok: false,
			message: 'No es un usuario Administrador',
			errors: {message: 'No puede realizar la acción requerida, no tiene los privilegios necesarios'}
		});
	}
}

/**
 * Verificar admin o mismo usuario
 */
exports.verficarAdminUsuarioActual = function(req, res, next) {
	const usuario = req.usuario;
	const id = req.params.id;
	if (usuario.role === 'ADMIN_ROLE' || usuario._id === id) {
		next();
		return;
	} else {
		return res.status(403).json({
			ok: false,
			message: 'No es un usuario Administrador',
			errors: {message: 'No puede realizar la acción requerida, no tiene los privilegios necesarios'}
		});
	}

}