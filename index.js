const express = require('express'),
    app = express(),
    bodyparser = require('body-parser');
require('express-async-errors')

const db = require('./db'),
    employeeRoutes = require('./controller')


app.use(bodyparser.json())
app.use('/api/employees', employeeRoutes)
app.use((err, res) => {
    console.log(err)
    res.status(err.status || 500).send('Something went wrong!')
})


db.query("SELECT 1")
    .then(() => {
        console.log('db connection  succeeded.')
        app.listen(3000,
            () => console.log('server started at 3000'))
    })
    .catch(err => console.log('db connection failed. \n' + err))