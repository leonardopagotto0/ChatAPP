var currentChat = null;
var currentUser = null;
var lastElement = null;
var userOwner = document.getElementById('username').textContent;
var userPhoto = document.getElementById('photo').src.split('/').pop().split('.')[0];

// ELEMENTS
var chats = document.querySelectorAll('.contact');
var messages_container = document.getElementById('Messages');
var chat_header = document.getElementById('chat-header');
var my_requests = document.getElementById('requestSent');
var request_from = document.getElementById('requestReceived');
var chatsList = document.getElementById('chatList');

const socket = io({});

socket.on('connect_error', async function (err) {
    console.log("disconected");
    console.log(err.data);
});
socket.on('message received', async function (msg) {
    if(msg.chatID == currentChat){
        render.chatMessage({
            from: msg.from,
            content: msg.content
        });
    }
    saveOnLocalStorage(msg.chatID, {
        id: msg.id,
        chatID: msg.chatID,
        content: msg.content,
        from: msg.from,
    });
});
socket.on('request received', async function (req) {
    await render.request(req.requestID, {photoID: req.photo, username: req.from, sending: false});
});
socket.on('request event', async function (data) {
    let request_element = document.getElementById(data.requestID);
    console.log(data);
    if(data.status == "ACCEPT"){
        await render.chatCart(data.chat.id, data.chat.name, data.chat.photo);
        request_element.remove();
    }
    else if(data.status == "REJECT"){
        alertRender(`${data.from} reject the request`, alertTypes.warning, {});
        request_element.remove();
    }else if(data.status == "CANCEL"){
        request_element.remove();
    }else{
        return;
    }
});

defineChats();

async function defineChats()
{
    let chatsElements = Array.prototype.slice.call(chats);
    
    chatsElements.forEach(chat => {
        chat.addEventListener('click', getChat);
    });
}

async function sendMessage()
{
    const message = document.getElementById('message-to-send');
 
    if(!message.value) return;
    if(!currentChat) return;

    socket.emit('send message', {
        chatID: currentChat,
        to: currentUser,
        content: message.value
    });

    saveOnLocalStorage(currentChat, {
        chatID: currentChat,
        content: message.value,
        from: userOwner,
    });

    render.chatMessage({
        from: userOwner,
        content: message.value
    });

    message.value = '';
}

async function getChat()
{
    let [ img_element, span_element ] = this.children;
    const chatID = this.id;
    const photo = img_element.attributes.src.nodeValue;
    const username = span_element.textContent;

    if(currentChat && currentChat == chatID) return;
    
    messages_container.innerHTML = '';
    currentChat = chatID;
    currentUser = username;

    render.chatHeader(username, photo);
    
    if(localStorage.length > 0){
        const chat = localStorage.getItem(chatID);
        if(chat){
            const chatContent = JSON.parse(chat);
            
            chatContent.forEach(msg => {
                render.chatMessage({
                    from: msg.from,
                    content: msg.content
                });
            });

            return
        }
    }
    
    const url = `http://localhost:8080/chat/${chatID}`;

    const request = await fetch(url, {
        method: "POST"
    });

    const result = await request.json();

    if(!result.data){
        const alert = await createChatAlert('Try to start a conversation in that chat, say "Hi"');
        messages_container.appendChild(alert);
        return;
    }

    result.data.sort(function (a, b){
        return new Date(a.createdAt) - new Date(b.createdAt);
    })

    localStorage.setItem(chatID, JSON.stringify(result.data));

    result.data.forEach(msg => {
        render.chatMessage({
            from: msg.from,
            content: msg.content
        });
    });
}



async function createChatAlert(msg)
{
    let chat_alert = document.createElement('div');
    let content = document.createElement('span');

    chat_alert.className = 'chat-alert';
    content.textContent = msg;
    chat_alert.appendChild(content);

    return chat_alert;
}

async function saveOnLocalStorage(key, data)
{

    let result = localStorage.getItem(key);
    let dataFormated = data;

    if(typeof data == 'object') {
        if(Array.isArray(data)){
            dataFormated = null;
            dataFormated = JSON.stringify(data);
        }
        else{
            dataFormated = new Array();
            dataFormated.push(data);
            dataFormated = JSON.stringify(dataFormated);
        }
    }

    if(!result){
        localStorage.setItem(key, dataFormated);
    }

    result = JSON.parse(result);
    result.push(data);
    result = JSON.stringify(result);
    localStorage.setItem(key, result);

}

async function someUpdate()
{
    const lastMessages = await getLastMessages();
    const chatsData = new Array();
    
    
    lastMessages.forEach((msg) => {
        chatsData.push(msg);
    })
    
    const request = await fetch("http://localhost:8080/chat/reaload", {
        body: {
            chats: chatsData
        }
    });
}

async function getLastMessages()
{

    const filds = new Array();
    const messages = new Map();

    for (let index = 0; index < localStorage.length; index++) {
        let content = localStorage.key(index);
        if(content){
            filds.push(content);
        }
    }

    filds.forEach(chatID => {
        let conversation = localStorage.getItem(chatID);
        if(conversation){
            conversation = JSON.parse(conversation); 
            conversation = conversation.pop(); // PEGANDO O ULTIMO ELEMENTO/MENSAGEM DO ARRAY
            messages.set(chatID, conversation); 
        }
    });

    return messages;

}

async function lastUpdate()
{
    let dateF = new Date();
    let time;
    let date;

    time = dateF.toTimeString().split(' ')[0];
    date = dateF.toISOString().split('T')[0];

    return date + ' ' + time;
}

async function acceptRequest(element, requestID)
{
    if(!requestID) requestID = element.parentNode.parentNode.id;

    const request = await fetch(`http://localhost:8080/chat/request`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            requestID,
            status: 'ACCEPT'
        })
    });

    const result = await request.json();

    if(request.status == 200){
        alertRender('Request accepted', alertTypes.success, {});
        render.chatCart(result.data.id, result.data.name, result.data.photo);
        element.parentNode.parentNode.remove();
        socket.emit('request event', {
            requestID,
            status: 'ACCEPT'
        });
        return;
    }

    await alertRender('Some error occurred when accepting the request.', alertTypes.error, {});
}
async function rejectRequest(element, requestID)
{
    if(!requestID) requestID = element.parentNode.parentNode.id;

    const request = await fetch(`http://localhost:8080/chat/request`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            requestID,
            status: 'REJECT'
        })
    });

    if(request.status >= 400) await alertRender('Error to reject request, try in another time...', alertTypes.error, {});
    if(request.status == 204) {
        await alertRender('Request rejected', alertTypes.success, {});
        element.parentNode.parentNode.remove();
        socket.emit('request event', {
            requestID,
            status: 'REJECT'
        });
    }
    
}

async function cancelRequest(element, requestID)
{
    if(!requestID) requestID = element.parentNode.parentNode.id;

    const request = await fetch(`http://localhost:8080/chat/request`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            requestID,
            status: 'CANCEL'
        })
    });

    if(request.status == 204 || request.status == 200){
        alertRender('Success...', alertTypes.success, {time: 5000, animation: 1000});
        element.parentNode.parentNode.remove();
        socket.emit('request event', {
            requestID,
            status: 'CANCEL'
        });
        return
    }

    const result = await request.json();

    if(result.httpStatusCode >= 400){
        const response = result.response;
        if(response == 'INVALID_STATUS_FIELD') return alertRender('Invalid status!', alertTypes.error, {});
        else if(response == 'INVALID_REQUEST') return alertRender('This request do not exist!', alertTypes.error, {});
        else if(response == 'INVALID_ACTION') return alertRender('You can not do it!', alertTypes.warning, {});
        else return alertRender('Error to cancel the request!', alertTypes.error, {})
    }
}

async function sendRequest()
{
    const username = document.getElementById('request-username');

    if(!username.value) return;

    const request = await fetch(`http://localhost:8080/chat/request/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: username.value
        })
    });

    const result = await request.json();

    if(result.httpStatusCode == 201) {
        alertRender("Request sent successfully!", alertTypes.success, {});
        render.request(result.data.requestID,
        {username: result.data.username, photoID: result.data.photo, sending: true});
        socket.emit('send request', {
            requestID: result.data.requestID,
            from: userOwner,
            to: username.value,
            photo: userPhoto 
        });
    };
    
    if(result.httpStatusCode > 399){
        if(result.response == 'INVALID_USERNAME'){
            alertRender("This user do not exist!", alertTypes.warning, {});
            return;
        }
        alertRender("Error to send request!", alertTypes.error, {});
    }

    username.value = '';
}




let lastNavOption; 

let navContent = document.querySelectorAll('.content');
let navOptions_elements = document.querySelectorAll('.nav-opts');

let navOptions = Array.prototype.slice.call(navOptions_elements);
let contents = Array.prototype.slice.call(navContent);



navOptions.forEach(opt => {
    opt.addEventListener('click', (e) => {

        let navOption = e.target;

        if(lastNavOption == navOption) return;
        if(!lastNavOption) lastNavOption = navOption;
        if(lastNavOption != navOption) {lastNavOption.classList.remove('nav-opts-slected'); lastNavOption = navOption};

        lastNavOption.classList.add('nav-opts-slected');
        
        const showOpt = navOption.id;
        let content = showOpt.split('Btn')[0];
        let contentElement;
        contents.forEach(emet => {
            if(emet.id != content) return emet.classList.remove('contentSelected');
            contentElement = emet;
        });
        contentElement.classList.add('contentSelected');
    })
})



let requestSession = document.querySelectorAll('.request-session');
let requestSessions = Array.prototype.slice.call(requestSession);

requestSessions.forEach(reqSession => {
    
    reqSession.children[0].addEventListener('click', e => {
        const classList = reqSession.classList;
        let Clicked;
        classList.forEach(cls => cls == 'request-session-clicked'? Clicked=true : Clicked=false)
        
        if(Clicked) return reqSession.classList.remove('request-session-clicked');

        reqSession.classList.add('request-session-clicked')
    });

});

let RequestBtn = document.querySelectorAll('.req-btn');
let RequestBtns = Array.prototype.slice.call(RequestBtn);

RequestBtns.forEach(btn => {
    if(btn.value == 'ACCEPT'){
        btn.addEventListener('click', async function(){acceptRequest(this)});
    }
    if(btn.value == 'REJECT'){
        btn.addEventListener('click', async function(){rejectRequest(this)});
    }
});

let cancelRequestBtn = document.querySelectorAll('.cancel-request-btn');
let cancelRequestBtns = Array.prototype.slice.call(cancelRequestBtn);

cancelRequestBtns.forEach(reqSelected => {
    reqSelected.addEventListener('click', async function(){cancelRequest(this, reqSelected.id)});
})

let sendRequest_btn = document.getElementById('sendRequest');
sendRequest_btn.addEventListener('click', sendRequest);