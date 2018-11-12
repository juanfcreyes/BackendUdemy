const express = require('express');
const path = require('path');
const fs = require('fs');
const imagesRoutes = express();

// Rutas
imagesRoutes.get('/:tipo/:img', (req, res, next) => {
    const tipo = req.params.tipo;    
    const img = req.params.img;
    const pathImagen = path.resolve(__dirname, `../uploads/${tipo}/${img}`);
    if (fs.existsSync(pathImagen)) {
        res.sendfile(pathImagen);
    } else {
        const pathNoImage = path.resolve(__dirname, `../assets/no-img.jpg`);
        res.sendFile(pathNoImage);
    }
})

module.exports = imagesRoutes;