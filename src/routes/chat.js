const router = require('express').Router();

const redirectError = require('../Utils/redirectError');
const chatController = require('../controllers/chat');

router
    .get('/', chatController.index)
    .post('/:id', chatController.getMessages)
    .post('/request/send', redirectError(chatController.sendRequest))
    .put('/request', redirectError(chatController.requests))
;

module.exports = router;