const { conn } = require('../config/connection');
const { buildID } = require('../Utils/buildID');
const createError = require('http-errors');

exports.registerUser = async function (user = {email, username, password})
{

    const userID = await buildID();
    user.id = userID;
    user.permitions = 'Standard';
    user.photo = 'user00'

    try {
        
        const [ result ] = await conn.execute('INSERT INTO users (id, email, username, password, permitions) VALUES (?, ?, ?, ?, ?)', 
        [user.id, user.email, user.username, user.password, user.permitions]);

        if(!result.affectedRows)
        throw createError(500, {body: {
            httpStatusCode: 500,
            response: 'ERROR_TO_REGISTER',
            msg: 'Error to create a new register, try again.',
        }})

        return {
            id: user.id,
            email: user.email,
            username: user.username,
            permition: user.permitions
        };

    } catch (err) {
        if(err.body) throw err;
        throw err; // Tratamento do error
    }
}