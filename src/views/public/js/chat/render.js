var render = 
{
    chatCart: async function (chatID, name, photoID)
    {
        let contact_element = document.createElement('div');
        contact_element.id = chatID;
        contact_element.className = 'contact';
        contact_element.addEventListener('click', getChat); // Event

        let name_element = document.createElement('span');
        name_element.textContent = name;

        let photo_element = document.createElement('img');
        photo_element.src = `/public/img/${photoID}.png`;

        contact_element.appendChild(photo_element);
        contact_element.appendChild(name_element);

        chatsList.appendChild(contact_element);
    },

    request: async function (requestID, user = {username, photoID, sending})
    {
        let request_element = document.createElement('div');
        request_element.className = 'request'

        let request_data_element = document.createElement('div');
        request_data_element.className = 'req-data'

        let photo_element = document.createElement('img');
        photo_element.src = `${publicPath}/img/${user.photoID}.png`;

        let username_element = document.createElement('span');
        username_element.textContent = user.username;

        let options_element = document.createElement('div');
        options_element.className = 'opts'

        let cancel_opt_element = document.createElement('input');
        cancel_opt_element.type = 'submit';
        cancel_opt_element.value = 'CANCEL';
        cancel_opt_element.addEventListener('click', async function () {cancelRequest(this, requestID)});

        let accept_opt_element = document.createElement('input');
        accept_opt_element.type = 'submit';
        accept_opt_element.value = 'ACCEPT';
        accept_opt_element.addEventListener('click', async function () {acceptRequest(this, requestID)});

        let reject_opt_element = document.createElement('input');
        reject_opt_element.type = 'submit';
        reject_opt_element.value = 'REJECT';
        reject_opt_element.addEventListener('click', async function () {rejectRequest(this, requestID)});

        request_data_element.appendChild(photo_element);
        request_data_element.appendChild(username_element);
        request_element.appendChild(request_data_element);
        if(user.sending) options_element.appendChild(cancel_opt_element);
        else{
            options_element.appendChild(accept_opt_element);
            options_element.appendChild(reject_opt_element);
        }
        request_element.appendChild(options_element);

        if(user.sending) {my_requests.appendChild(request_element);  return};
        request_from.appendChild(request_element);
    },

    chatMessage: async function (msg)
    {
        let message = document.createElement('div');
        let content = document.createElement('span');

        content.textContent = msg.content;
        message.className = "message";
        if(msg.from == userOwner){
            message.className = "user-message";
        }
        
        message.appendChild(content);
        messages_container.appendChild(message);
        lastElement = messages_container.lastElementChild;
        lastElement.id = 'last-element';
    },

    chatHeader: async function (name, photo)
    {
        chat_header.innerHTML = '';

        let name_element = document.createElement('span');
        let photo_element = document.createElement('img');
        
        name_element.textContent = name;
        photo_element.src = photo;

        chat_header.appendChild(photo_element);
        chat_header.appendChild(name_element);
    },
}
