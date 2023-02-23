module.exports = errorHandler;

async function errorHandler(err, req, res, next)
{
    console.log(err);

    if(!err.body){
        return res.status(500).json({
            httpStatusCode: 500,
            response: 'UNKNOWN_ERROR',
            msg: null
        });
    }

    res.status(err.body.httpStatusCode).json(err.body);
}