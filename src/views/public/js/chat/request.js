async function acceptRequest(element, requestID)
{
    if(!requestID) requestID = element?.id;

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
            status: 'ACCEPT',
        });
        return;
    }

    await alertRender('Some error occurred when accepting the request.', alertTypes.error, {});
}

async function rejectRequest(element, requestID)
{
    if(!requestID) requestID = element?.id;

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
            status: 'REJECT',
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