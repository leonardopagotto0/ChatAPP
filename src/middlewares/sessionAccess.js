

exports.sessionAccess = function(permitions){
    return async function (req, res, next)
    {
        
        const userPermition = req.session.user?.permition;
        
        if(!userPermition){
            return res.status(301).redirect('/auth/login');
        }

        const result = permitions.find((permition) => {
            return permition === userPermition;
        })

        if(!result){
            return res.status(301).redirect('/auth/login');
        }

        next();
        
    }
}

exports.Permitions = {
    "admin": "Admin",
    "standard": "Standard"
};