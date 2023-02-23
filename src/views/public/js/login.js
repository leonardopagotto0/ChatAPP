var errorDiv = document.getElementById('error-scope');

async function send()
{
    const email = document.getElementById('field-email').value;
    const password = document.getElementById('field-password').value;

    const response = await fetch('http://localhost:8080/auth/', {
        method: "POST",
        body: JSON.stringify({email, password}),
        headers: {
            'Content-Type': 'application/json'
        }
    })

    if(response.redirected)
    return window.location.replace("http://localhost:8080/chat/");

    const finalResponse = await response.json();
    if(finalResponse.httpStatusCode > 399) errorMessage(finalResponse.msg);
    else errorMessage("Some error happened, try again!")
}

function errorMessage(msg)
{
    let element = document.createElement('span');
    element.className = "error-msg",
    element.id = "err-msg",
    element.textContent = 'Warning: '+ msg

    let erroMessage = document.getElementById('err-msg');

    if(erroMessage){
        return element.textContent = 'Warning: '+ msg;
    }
    errorDiv.appendChild(element)
}