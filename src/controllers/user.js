const userService = require('../services/user');

exports.index = async function (req, res, next){
    res.render('user', {user: {email: req.session.user.username}});
}

exports.setPhoto = async function (req, res, next)
{
    const { photoID } = req.body;
    const userID = req.session.user.id;

    await userService.setphoto(photoID, userID);
    req.session.user.photo = photoID;

    res.status(204).json();
}

exports.setPhotoIndex = async function (req, res, next)
{
    res.render('setPhoto', {layout: false});
}