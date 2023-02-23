const router = require('express').Router();

// ROUTES AND MIDDLEWARES
const { sessionAccess, Permitions } = require('../middlewares/sessionAccess');
const chatRoutes = require('./chat');
const authRoutes = require('./auth');
const userRoutes = require('./user');

router
    .use('/auth', authRoutes)
    .use(sessionAccess([Permitions.admin, Permitions.standard]))
    .use('/chat', chatRoutes)
    .use('/user', userRoutes)
;

module.exports = router;