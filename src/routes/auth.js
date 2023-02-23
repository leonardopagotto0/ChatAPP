const router = require('express').Router();

const loginController = require('../controllers/login');
const registerController = require('../controllers/register');

router
    .get('/login', loginController.index)
    .post('/', loginController.login)
    .get('/register', registerController.index)
    .post('/register', registerController.newUser)
;

module.exports = router;