const mysql = require('mysql2/promise');

const conn = mysql.createPool(process.env.MYSQL_URL_CONNECTION || 'mysql://root:teste123@localhost/chat');

module.exports = { conn };