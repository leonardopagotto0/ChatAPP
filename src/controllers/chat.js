const { conn } = require('../config/connection');
const { buildID } = require('../Utils/buildID');
const requestService = require('../services/request');
const chatService = require('../services/chat');
const requestsModel = require('../models/requests');
const userService = require('../services/user');

exports.index = async function (req, res, next){
    
    const { id, username, photo } = req.session.user;
    let chats = null; 
    let requests = null;
    
    try {
        requests = await requestService.list(id);
        await requestService.format(requests);
        
        if(requests.Accpets[0]) chats = await requestService.verify(requests.Accpets, username, id);

        res.render('chat', {layout: false, chats: chats, user: {username, photo}, requests: requests?.From});
    } catch (err) {
        throw err;
    }
}

exports.getMessages = async function (req, res, next)
{
    const { id } = req.params;

    try {
        const [ result ] = await conn.execute("SELECT * FROM messages where chatID=?", [id]);
        
        if(!result[0]){
            return res.status(404).json({
                httpStatusCode: 404,
                response: 'CHAT_MESSAGES_NOT_FOUND',
                msg: 'Start a new conversation with this user, send a "Hi!".'
            });
        }
        
        res.status(200).json({
            httpStatusCode: 200,
            response: 'SUCCESS',
            msg: null,
            owner:  req.session.user.username,
            data: result
        });

    } catch (err) {
        throw err;
    }
}

exports.sendRequest = async function (req, res, next)
{
    const { username } = req.body;
    const { user } = req.session;

    if(username == user.username)
    return res.status(400).json({
        httpStatusCode: 400,
        response: 'CANT_SELF_REQUEST',
        msg: 'You cannot request yourself.'
    });

    const toUser = await userService.findByUsername(username);
    
    if(!toUser)
    return res.status(400).json({
        httpStatusCode: 400,
        response: 'INVALID_USERNAME',
        msg: 'This user do not exist.'
    });

    const result = await requestService.send({to: toUser.id, user: user.id});
    
    res.status(201).json({
        httpStatusCode: 201,
        response: 'SUCCESS',
        msg: null,
        data: {
            requestID: result.requestID,
            username: username,
            photo: toUser.photo,
        }
    });
}

exports.requests = async function (req, res, next)
{
    const { requestID, status } = req.body;
    const user = req.session.user.id;

    const isStatusValid = requestsModel.status.values.includes(status);

    if(!isStatusValid)
    return res.status(400).json({
        httpStatusCode: 400,
        response: "INVALID_STATUS_FIELD",
        msg: null
    });

    const request = await requestService.exist(requestID);
    
    if(!request)
    return res.status(400).json({
        httpStatusCode: 400,
        response: 'INVALID_REQUEST',
        msg: null,
    })

    if(request.username != user && request.from != user)
    return res.status(400).json({
        httpStatusCode: 400,
        response: 'INVALID_ACTION',
        msg: null,
    });
    if(request.from == user && status != 'CANCEL' || request.username == user && status == 'CANCEL')
    return res.status(400).json({
        httpStatusCode: 400,
        response: 'INVALID_ACTION',
        msg: null,
    });

    await requestService.set({id: requestID, status}, user);

    if(status == 'ACCEPT')
    {
        const chat = await chatService.create({
            id: request.chatID,
            users: JSON.stringify([request.username, request.from]),
            name: null,
            requests: null,
        });

        const { username, photo } = await userService.findById(request.from);

        return res.status(200).json({
            httpStatusCode: 200,
            response: 'SUCCESS',
            msg: null,
            data: {
                id: chat.id, 
                name: chat.name ?? username,
                photo: photo
            }
        });
    }

    res.status(204).json({});
}

async function listChats(user, requests)
{
    const requestsFormated = new Array();
    const reqFinal = new Array();

    try {
        const [ chatIDs ] = await conn.execute("SELECT chats FROM users WHERE username = ?", [user]);

        if(!chatIDs[0] || !chatIDs[0].chats && !requests || !requests[0]) return {chats: null, request: null};
        
        if(requests[0] && !chatIDs[0] || !chatIDs[0].chats){
            const ids = new Array();
            let fields = '';
            let request = new Array();

            requests.forEach(req => {
                ids.push(req.chatID)
                fields += "?,";
            });
            fields = fields.slice(0, -1);

            const [ result ] = await conn.execute(`SELECT id, users, name FROM chats WHERE id IN (${fields})`, ids);
            
            if(!result[0]) return {chats: result, request: requests};
            
            result.forEach(chat => {
                
                dotExist = requests.filter((req) => {
                    return req.chatID !== chat.id;
                });

                if(dotExist[0]){
                    request.push(dotExist[0]);
                }

                if(!chat.name){
                    chat.name = chat.users.find((u)=>{
                        return u != user
                    });
                }
            });

            return {chats: result, request: request};
        }
        
        const ids = chatIDs[0].chats;
        
        // Quantidade de elementos para serem analizados pelo Mysql
        let fields = '';
        ids.forEach(id => {
            fields += "?,";
        });
        fields = fields.slice(0, -1);

        requests.forEach((request)=>{
            const chatID = request.chatID;
            const result = ids.find((id) => {
                return chatID == id;
            });
            if(!result){
                ids.push(chatID);
                requestsFormated.push(chatID);
            }
        });

        const [ result ] = await conn.execute(`SELECT id, users, name FROM chats WHERE id IN (${fields})`, ids);

        result.forEach(chat => {
            requestsFormated.forEach((reqChatID) => {
                if(reqChatID != chat.id){
                    reqFinal.push(reqChatID);
                }
            });
            if(!chat.name){
                chat.name = chat.users.find((u)=>{
                    return u != user
                });
            }
        });

        return {chats: result, request: reqFinal};
    } catch (err) {
        throw err;
    }
}