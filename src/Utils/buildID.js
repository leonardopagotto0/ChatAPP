const uuid = require('uuid');

exports.buildID = async function ()
{
    const id = uuid.v4();
    return id;
}