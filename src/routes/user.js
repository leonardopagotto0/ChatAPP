const router = require('express').Router();

// CONTROLLERS AND MIDDLEWARES
const redirectError = require('../Utils/redirectError');
const userController = require('../controllers/user');

router
    .get('/set-photo', userController.setPhotoIndex)
    .put('/set-photo', redirectError(userController.setPhoto))
;

module.exports = router;