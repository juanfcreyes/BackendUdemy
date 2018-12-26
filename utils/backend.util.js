/**
 * Responde con un estatus de error
 * @param {*} res 
 * @param {*} err 
 * @param {*} message 
 * @param {*} status 
 */
module.exports.responderConError = function responderConError(res, err, message, status) {
    return res.status(status).json({
        ok: false,
        message,
        errors: err
    });  
}

 