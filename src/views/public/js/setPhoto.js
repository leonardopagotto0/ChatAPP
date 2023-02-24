async function setPhoto(photoID) {
    
    const request = await fetch('/user/set-photo', {
        method: 'PUT',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            photoID: photoID
        })
    });
    
    if(request.status == 204) return window.location.replace('/chat/');
    console.log("ERROR_TO_SET");
};