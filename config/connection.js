require('dotenv').config();

const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: "mysql-4646e87-munjanijay421-29a8.k.aivencloud.com",
    user: 'avnadmin',
    password: "AVNS_PrwXNVTb-QYXBiCtWdJ",
    database: 'defaultdb',
    // port: '12023',
    // connectTimeout: 10000,
});

connection.connect(function (err) {
    if (err) {
        console.error('Error connecting to MySQL:', err.stack);
        return;
    }
    console.log('Connected to MySQL database as ID', connection.threadId);
});

module.exports = connection;
