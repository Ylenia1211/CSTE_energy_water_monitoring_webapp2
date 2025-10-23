const express = require('express');
const authRoutes = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

//Il token viene generato al momento del login
authRoutes.post('/login', authController.loginUser);

authRoutes.post('/register', authController.registerUser);

authRoutes.post('/logout', authMiddleware, authController.logoutUser);

module.exports = authRoutes;