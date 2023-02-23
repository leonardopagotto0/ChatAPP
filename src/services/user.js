const { conn } = require('../config/connection');
const createError = require('http-errors');

// exports.saveChat = async function (username, chatID)
// {
//     let chats = null;

//     const [ result ] = await conn.execute('SELECT chats FROM users WHERE username = ?', [username]);

//     if(!result[0] || !result[0].chats || !result[0].chats[0]){
//         chats.push(chatID);
//         chats = JSON.stringify(chats);
//         const [ user ] = 
//     }

//     chats = result[0].chats;
//     chats.push(chatID);
//     chats = JSON.stringify(chats);

// }

// exports.list = 
// {
//     chats: async function (id)
//     {

//     }
// }

exports.setphoto = async function (photoID, userID)
{
    try {
        const [ result ] = await conn.execute('UPDATE users SET photo = ? WHERE id = ?', [photoID, userID]);

        if(!result.changedRows)
        throw createError(500, {body: {
            httpStatusCode: 500,
            response: 'CANOT_SET_PHOTO',
            msg: null
        }});

        return;
    } catch (err) {
        if(err.body) throw err;
        throw err;
    }
}

exports.findByUsername = async function (username)
{
    try {
        const [ result ] = await conn.execute('SELECT * FROM users WHERE username = ?', [username]);

        if(!result[0]) return null;

        return result[0];
    } catch (err) {
        throw err;
    }
}

exports.findById = async function (userID)
{
    try {
        const [ result ] = await conn.execute('SELECT * FROM users WHERE id = ?', [userID]);

        if(!result[0]) return null;

        return result[0];
    } catch (err) {
        throw err;
    }
}