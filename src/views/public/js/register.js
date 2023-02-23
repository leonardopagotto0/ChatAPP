async function register()
{
    const emailField = document.getElementById('email');
    const usernameField = document.getElementById('username');
    const passwordField = document.getElementById('password');
    const confirmPasswordField = document.getElementById('confirm-password');

    const request = await fetch('http://localhost:8080/auth/register/', {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            email: emailField.value,
            username: usernameField.value,
            password: passwordField.value
        })
    });

    const result = await request.json();

    if(result.httpStatusCode == 201){
        window.location.replace('/user/set-photo')
    }
}