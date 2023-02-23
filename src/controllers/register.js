const authService = require('../services/auth')

exports.index = async function (req, res, next)
{
    if(req.session.authenticated) return res.status(301).redirect('http://localhost:8080/chat/');
    res.render('register', {layout: false});
}

exports.newUser = async function (req, res, next)
{
    if(req.session.authenticated) return res.status(301).redirect('http://localhost:8080/chat/');

    const { email, username, password } = req.body;

    const user = await authService.registerUser({email, username, password});
    
    req.session.authenticated = true;
    req.session.user = user;

    res.status(201).json({
        httpStatusCode: 201,
        response: 'SUCCESS',
        msg: null,
    });
}