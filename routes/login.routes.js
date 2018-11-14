const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const loginRoutes = express();
const {SEED, CLIENT_ID} = require('../config/config');
const Usuario = require('../models/usuario');

// Google
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

/**
 * Genera un token de un usuario autenticado
 * @param {*} usuario 
 * @param {*} res 
 */
function generarToken(usuario, res) {
     // Crae un token!!!
    usuario.password = ':)'
    const token = jwt.sign({usuario}, 
         SEED, {expiresIn: 14400});

    return res.status(200).json({
         ok: true,
         message: "Login post correcto",
         usuario,
         token,
         id: usuario.id
    });
}

/**
 * Responde con una estatus de error
 * @param {*} res 
 * @param {*} err 
 * @param {*} message 
 * @param {*} status 
 */
function responderConError(res, err, message, status) {
    return res.status(status).json({
        ok: false,
        message,
        errors: err
    });  
}

/**
 * Verifica el token de google
 * @param {*} token 
 */
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID
    });
    const payload = ticket.getPayload();
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}

/**
 * Guarda un nuevo usuario
 * @param {*} googleUser 
 */
function guardarUsuarioGoogle(googleUser) {
    const usuario = new Usuario();
    const {nombre, email, img} = googleUser
    usuario.nombre = nombre;
    usuario.email = email;
    usuario.img = img;
    usuario.google = true;
    usuario.password = ':)';
    usuario.save((err, usuarioNuevo) => {
        if(err) {
            return responderConError(res, err, 'Error al crear una nuevo usuario', 500);
        }
        generarToken(usuarioNuevo, res);
    });
}
  
/**
 * Autenticacion con google
 */
loginRoutes.post('/google', async (req, res) => {
    const token = req.body.token;
    const googleUser = await verify(token).catch((err) => {
        return responderConError(res, err, 'Token no válido', 403);
    });

    Usuario.findOne( {email: googleUser.email}, (err, usuarioDB) => {
        if (err) {
            return responderConError(res, err, 'Error al logear al usuario', 500);
        }
        if (usuarioDB) {
            if (!usuarioDB.google) {
                return responderConError(res, err, 'Debe usar su autenticación nativa', 400);
            } else {
                return generarToken(usuarioDB, res);
            }     
        } else {
            guardarUsuarioGoogle(googleUser);
        }
    });
});

/**
 * Autenticación nativa
 */
loginRoutes.post('/', (req, res) => {
    const body = req.body;
    Usuario.findOne({email: body.email}, (err, usuario) => {
        if (err) {
            return responderConError(res, err, 'Error al logear al usuario', 500);       
        }
        if (!usuario) {
            return responderConError(res, err, 'Credenciales incorrectas', 400);
        }
        if(!bcrypt.compareSync(body.password, usuario.password)) {
            return responderConError(res, err, 'Credenciales incorrectas', 400);
        }
        return generarToken(usuario, res);
    });
});

module.exports = loginRoutes;