async function setPhoto(photoID) {
    
    const request = await fetch('http://localhost:8080/user/set-photo', {
        method: 'PUT',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            photoID: photoID
        })
    });
    
    if(request.status == 204) return window.location.replace('http://localhost:8080/chat/');
    console.log("ERROR_TO_SET");
};