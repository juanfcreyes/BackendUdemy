const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const loginRoutes = express();
const SEED = require('../config/config').SEED;
const Usuario = require('../models/usuario');

loginRoutes.post('/', (req, res) => {

    const body = req.body;

    Usuario.findOne({email: body.email}, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al logear al usuario',
                errors: err
            });          
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                message: 'Credenciales incorrectas',
            });   
        }

        if(!bcrypt.compareSync(body.password, usuario.password)) {
            return res.status(400).json({
                ok: false,
                message: 'Credenciales incorrectas',
            });   
        }

        // Crae un token!!!
        usuario.password = ':)'
        const token = jwt.sign({usuario}, 
            SEED,
            {expiresIn: 14400});

        res.status(200).json({
            ok: true,
            message: "Login post correcto",
            usuario,
            token,
            id: usuario.id
        })
    
    });
});




module.exports = loginRoutes;