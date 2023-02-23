require('dotenv').config();
const http = require('http');
const express = require('express');
const socket = require('./socket');
const cors = require('cors');
const { engine } = require('express-handlebars');
const { session } = require('./src/config/session');

const app = express();
const server = http.createServer(app);
socket(server);

app.use(cors({origin: 'http://localhost:8080'}))
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(session);

const helpers = require('./src/Utils/helpers/root.js');
app.engine('handlebars', engine({layoutsDir: './src/views/templates', helpers}));
app.set('view engine', 'handlebars');
app.set('views', './src/views');

app.use('/public', express.static('./src/views/public'));
app.use(require('./src/routes/root'));
app.use(require('./src/middlewares/errorHandler'));

server.listen(process.env.PORT, () => {
    console.log(`App listing on port ${process.env.PORT}`);
})