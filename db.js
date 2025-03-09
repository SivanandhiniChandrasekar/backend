const mysql = require('mysql2/promise')

const mysqlPool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Cbsks@2004',
    database: 'crud_operations'
})


module.exports = mysqlPool