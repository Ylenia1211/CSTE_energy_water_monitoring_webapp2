const express = require('express');
const observerRoutes = express.Router();
const observerController = require('../controllers/observerController');
const authMiddleware = require('../middlewares/authMiddleware');

observerRoutes.post('/addObserver', authMiddleware, observerController.addObserver);
observerRoutes.delete('/removeObserver', authMiddleware, observerController.removeObserver);
observerRoutes.get('/getObservers', authMiddleware, observerController.getObservers);

observerRoutes.get('/isUserObserving', authMiddleware, observerController.isUserObserving);


module.exports = observerRoutes;
