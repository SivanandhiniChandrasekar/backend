const express = require('express'),
    app = express(),
    bodyparser = require('body-parser');
require('express-async-errors')

const db = require('./db'),
    employeeRoutes = require('./controller'),
    authRoutes = require('./authentication/auth'); 
    const verifyToken = require('./authentication/middleware');
    const session = require('express-session');
    require('dotenv').config();

    app.use(session({
        secret: process.env.JWT_REFRESH_SECRET,
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false, httpOnly: true }
    }));
    
app.use(bodyparser.json())

app.use('/api/auth', authRoutes)

app.use('/api/employees', verifyToken,employeeRoutes)

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