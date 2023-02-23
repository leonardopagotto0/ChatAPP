exports.format = async function (requests)
{
    const userIDs = new Array();

    requests.forEach((req) => {
        userIDs.push(req.username)
        userIDs.push(req.from)        
    });

    try {
        const [ users ] = await conn.query('SELECT id, username, photo FROM users WHERE id IN (?)', [userIDs]);
        
        requests.forEach(req => {
            users.forEach(user => {
                console.log(user);
                if(req.username == user.id){
                    req.username = user.username
                    req.photoUsername = user.photo
                    return;
                };
                if(req.from == user.id) {
                    req.from = user.username
                    req.photoFrom = user.photo
                    return;
                };
            });
        });
        
        return requests;
    } catch (err) {
        throw err;
    }
}