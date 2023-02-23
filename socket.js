const { Server } = require('socket.io');
const { session, storage } = require('./src/config/session');
const { conn } = require('./src/config/connection');
const { buildID } = require('./src/Utils/buildID');
const requestService = require('./src/services/request');
const chatService = require('./src/services/chat');
const userService = require('./src/services/user');

module.exports = socket;

async function socket(httpServer)
{
    const io = new Server(httpServer);

    io.engine.use(session); // USANDO SESSION PARA VALIDAR A SESSÂO DO USUARIO NO SOCKET

    io.on("connection", (socket) => {
        const { request } = socket;
        const user = request.session?.user;

        // SE O USUARIO NÂO SE AUTENTICOU
        if(!request.session.authenticated || !user){
            socket._error({body: {
                response: "DISCONNECTED",
                msg: "Not authenticated"
            }});
            socket.disconnect(true);
        }

        socket.join(user.username);

        socket.on('send message', async function (data) {
            data.id = await buildID();
            data.from = user.username;
            // const isOnline = io.sockets.adapter.rooms.get(data.to);
            saveOnDataBase(data);
            socket.to(data.to).emit('message received', {
                id: data.id,
                content: data.content,
                chatID: data.chatID,
                from: data.from,
            });
        });

        socket.on('send request', async function (data) {
            socket.to(data.to).emit('request received', data);
        });

        socket.on('request event', async function (req) {
            const chat = new Array();
            let toUser;
            const request = await requestService.exist(req.requestID);
            if(!request) return;

            if(req.status == 'ACCEPT'){
                const [ chats ] = await chatService.list.byChatID(request.chatID, user.username);
                if(!chats) return;
                chat.push(chats);
            }

            function userSelect()
            {
                if(request.from != user.id){
                    return request.from;
                }
                if(request.username != user.id){
                    return request.username;
                }
            }

            toUser = userSelect();
            toUser = await userService.findById(toUser);
    
            console.log(toUser);
            if(!toUser) return;

            socket.to(toUser).emit('request event', {
                requestID: req.requestID,
                status: req.status,
                chat: {
                    id: chat[0]?.id,
                    name: chat[0]?.name ?? user,
                    photo: chat[0]?.photo ?? user.photo,
                }
            });

        });

    });
}

// VALIDAR SE O USUARIO POSSUI UMA SESSÂO, VALIDAR SE O USUARIO POSSUI ALGUM ROOM ABERTO. SE ROOM ESTIVER ABERTO ENVIA DIRETO PARA O USER, SE ROOM ESTIVER FECHADO MAS SESSÂO ONLINE INSERIR NA SESSÂO

async function saveOnDataBase(data)
{
    const [ result ] = await conn.execute('INSERT INTO messages(`id`, `chatID`, `content`, `from`) VALUES (?, ?, ?, ?)', [
        data.id,
        data.chatID,
        data.content,
        data.from,
    ]);
    // result.affectedRows
}