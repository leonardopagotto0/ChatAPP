const session = require('express-session');
const storage = new session.MemoryStore();

const instance = session({
    secret: "test123",
    resave: true,
    saveUninitialized: true,
    cookie: {
        sameSite: true,
        maxAge: 3600000,
        httpOnly: false,
        secure: false,
    },
    store: storage
})

module.exports = { storage, "session": instance };