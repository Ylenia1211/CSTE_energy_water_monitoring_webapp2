const express = require('express');
const multer = require('multer');
const path = require('path');
const fileController = require('../controllers/fileController');

// Configurazione di Multer per gestire il salvataggio dei file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo di file non supportato'), false);
    }
  }
});

const fileRoutes = express.Router();

// Route per caricare un file immagine
fileRoutes.post('/upload-image', upload.single('image'), fileController.uploadFile);

module.exports = fileRoutes;
