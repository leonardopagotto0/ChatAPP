const { conn } = require('../config/connection');
const { buildID } = require('../Utils/buildID')
const chatService = require('./chat');
const createError = require('http-errors');
const { Err } = require('../Utils/Err');

exports.list = async function (userID)
{

    const Accpets = new Array();
    const Refused = new Array();
    const From = new Array();

    try {
        const [ reqs ] = await conn.execute('SELECT * FROM requests WHERE username = ? OR `from` = ?', [userID, userID]);

        if(!reqs[0]) return {Accpets, Refused, From};;

        reqs.forEach(request => {
            // requests do usuario
            if(request.status == 'ON HOLD'){
                From.push(request);
                return;
            }
            // requests negadas
            if(request.status == 'REFUSED'){
                Refused.push(request);
                return;
            }
            // requests aceitas
            if(request.status == 'ACCEPT'){
                Accpets.push(request);
                return;
            }
        });

        return {Accpets, Refused, From};

    } catch (err) {
        throw err;
    }

}

exports.verify = async function (request, user, userid)
{

    if(!request[0]) throw new Err({code: "REQUEST_CANT_BE_NULL"});

    const chatIDs = new Array();
    const quntReq = request.length;

    request.forEach(req => {
        chatIDs.push(req.chatID);
    });

    try {
        const chats = await chatService.list.byChatID(chatIDs, user);

        if(!chats) {
            try {
                const fixed = await chatService.fix(request);
                if(!fixed) throw Err({code: "NOT_FIXED"});
                return null;
            } catch (error) {
                console.log(error);
                return null;
            }
        }

        // NÃO ME LEMBRO O QUE EU FIZ E NEM PARA QUE SERVE ISSO, MAS TA FUNCIONANDO
        for (let index = 0; index < quntReq; index++) {
            chats.forEach(chat => {
                if(!request[index]) return;
                if(chat.id == request[index].chatID){
                    if(chat.users.length == 2){
                        let userFromated;
                        chat.users.forEach(userID => {
                            if(userID == request[index].fromID && request[index].fromID == userid){
                                userFromated = {
                                    name: request[index].username,
                                    photo: request[index].photoUsername,
                                };
                            }
                            if(userID == request[index].usernameID && request[index].usernameID == userid){
                                userFromated = {
                                    name: request[index].from,
                                    photo: request[index].photoFrom,
                                };
                            }
                        });

                        chat.name = userFromated.name;
                        chat.photo = userFromated.photo;
                    }
                    request.splice(index, 1);
                    index = - 1;
                }
            });
        }

        if(!request[0]) return chats;
        
        chatService.fix(request);
        
        return chats;

    } catch (err) {
        if(err.code) throw err;
        throw err;
    }
}

exports.send = async function ({to, user})
{

    const requestID = await buildID();
    const chatID = await buildID();

    try {
        const [ result ] = await conn.execute('INSERT INTO requests (id, chatID, username, `from`) VALUES (?, ?, ?, ?)',
        [requestID, chatID, to, user]);

        if(result.affectedRows == 1){
            return {requestID, chatID};
        }
        
        throw createError(500, {body: {
            httpStatusCode: 500,
            response: 'ERROR_TO_SENT_REQUEST',
            msg: null
        }});
    } catch (error) {
        if(error.body) throw error;

        if(error.code == 'ER_DUP_ENTRY')
        throw createError(400, {body: {
            httpStatusCode: 400,
            response: 'ALREADY_SENT',
            msg: null
        }});
        
        throw error
    }
}

exports.exist = async function (requestID)
{
    try {
        const [ req ] = await conn.execute('SELECT * FROM requests WHERE id = ?', [requestID]);
    
        if(!req[0]) return null;
    
        return req[0];
    } catch (err) {
        throw err;
    }
}

exports.set = async function (request = {id, status}, user)
{
    try {
        const [ result ] = await conn.execute('UPDATE requests SET status = ? WHERE id = ?', [request.status, request.id]);
        
        if(result.changedRows == 0)
        throw createError(500, {body: {
            httpStatusCode: 500,
            response: 'ERROR_TO_SET_REQUEST',
            msg: null,
        }});

        return;
    } catch (err) {
        throw err;
    }
}

exports.format = async function (requests)
{

    const result = await Promise.all(
        [formatRequest(requests.Accpets, 'Accpets'), formatRequest(requests.Refused, 'Refused'), formatRequest(requests.From, 'From')]
    );

    return result.reduce(function(target, key, index){
        let newKey = Object.keys(key);
        target[newKey[0]] = key[newKey[0]];
        return target;
    });

    async function formatRequest (request, objName){
        if(!request || !request[0]) {
            if(objName) return {[objName]: []};
            return [];
        };

        const userIDs = new Array();
        const status = request[0].status;

        request.forEach((req) => {
            userIDs.push(req.username)
            userIDs.push(req.from)        
        });

        try {
            const [ users ] = await conn.query('SELECT id, username, photo FROM users WHERE id IN (?)', [userIDs]);
            
            request.forEach(req => {
                users.forEach(user => {
                    if(req.username == user.id){
                        req.usernameID = user.id
                        req.username = user.username
                        req.photoUsername = user.photo
                        return;
                    };
                    if(req.from == user.id) {
                        req.fromID = user.id
                        req.from = user.username
                        req.photoFrom = user.photo
                        return;
                    };
                });
            });
            
            if(objName) return {[objName]: request};
            return request;
        } catch (err) {
            throw err;
        }
    }

}