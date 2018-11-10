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