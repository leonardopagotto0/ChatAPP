class Err extends Error {
    constructor(data) {
       super(data.message);
       this.code = data.code;
    }
}

exports.Err = Err;