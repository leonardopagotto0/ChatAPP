const { conn } = require('../config/connection');
const { Err } = require('../Utils/Err');

exports.create = async function (chat = {id, users, requests, name})
{
    try {
        const [ result ] = await conn.execute('INSERT INTO chats (id, users, requests, name) VALUES (?, ?, ?, ?)',
        [chat.id, chat.users, chat.requests, chat.name]);
        
        if(!result.affectedRows) throw new Err({code: "NOT_INSERTED"});
        
        return chat;
    } catch (err) {
        if(err.code) throw err;
        throw err;
    }    
}

exports.list = {

    byUserID: async function (userID)
    {
        if(!userID) throw Err({code: "USERID_CANOT_BE_NULL"});

        try {
            const [ chatsIDs ] = await conn.execute('SELECT chats FROM users WHERE id = ?', [userID]);
            
            if(!chats[0] || !chats[0].chats || !chats[0].chats[0]) return null;

            return await byChatID(chatsIDs[0].chats);
        } catch (err) {
            if(err.code) throw err;
            throw err;
        }
    },

    byChatID: async function (chatID, user)
    {
        if(!chatID[0]) throw Err({code: "CHATID_CANOT_BE_NULL"});

        try {
            const [ chats ] = await conn.query('SELECT * FROM chats WHERE id IN (?)', [chatID]);

            if(!chats[0]) return null;

            chats.forEach((chat) => {
                if(!chat.name){
                    chat.name = chat.users.find((u)=>{
                        return u != user
                    });
                }
            });

            return chats;
        } catch (err) {
            throw err;
        }
    }
}

exports.fix = async function (requests = new Array())
{
    if(!requests[0]) throw Err({code: "CHATS_CAN_NOT_BE_NULL"}); 

    let chats;
    console.log(requests);
    requests.forEach(req => {
        const users = JSON.stringify([req.usernameID, req.fromID]);
        chats = [req.chatID, users];
    });

    try {
        const [ result ] = await conn.execute('INSERT INTO chats (id, users) VALUES (?, ?)', chats);
        if(result.affectedRows == 0) throw Err({code: "ERROR_TO_INSERT_CHATS"});
        return true;
    } catch (err) {
        if(err.code) throw err;
        throw err;
    }
}

// exports.format = async function (usersID)
// {
//     try {
//         const [ users ] = await conn.query('SELECT id, username, photo FROM users WHERE id IN (?)', [usersID]);
//         return users;
//     } catch (err) {
//         throw err;
//     }
// }