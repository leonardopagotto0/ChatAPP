const { conn } = require('../config/connection');
const { storage } = require('../config/session');

module.exports = {login, index}

async function login(req, res, next)
{
    const { email, password } = req.body;

    if(req.session.authenticated) return res.status(301).redirect('http://localhost:8080/chat/');

    try {
        const result = await conn.execute('SELECT * FROM users WHERE email=? AND password=?', [email, password]);

        if(!result[0].length) 
        return res.status(400).json({
            httpStatusCode: 400,
            response: "INVALID_DATA",
            msg: "Invalid email or password."
        });

        // DEFININDO SESSION DATA
        req.session.authenticated = true;
        req.session.user = {
            id: result[0][0].id,
            email: result[0][0].email,
            username: result[0][0].username,
            permition: result[0][0].permitions,
            photo: result[0][0].photo,
        };

        return res.status(301).redirect('/?chats=teste');
    } catch (err) {
        return res.status(500).json({
            httpStatusCode: 500,
            response: "UNAVAILABLE_SERVICE",
            msg: "try again or await some time."
        });
    }
}

async function index(req, res, next){
    if(req.session.authenticated) return res.status(301).redirect('http://localhost:8080/chat/');
    res.render('login', {layout: false});
}