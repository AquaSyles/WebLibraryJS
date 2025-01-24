const express = require('express')
const server = express();
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');

server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(cookieParser());

function verifyToken(token) { // returns decoded token or 0 (FAIL)
    let options = {
        algorithm: 'HS256',
        expiresIn: '1h'
    }

    try {
        return jwt.verify(token, process.env.SECRET_KEY, options);
    } catch (error) {
        console.log('Error:', error);
        return 0;
    }
}

server.use((req, res, next) => { // isAuth
    if (req.cookies.token) {
        let user = verifyToken(req.cookies.token);
        if (user) {
            user.isAuth = true;
            req.user = user;
        } else {
            req.user = {isAuth: false};
        }
    } else {
        req.user = {isAuth: false};
    }
    next();
});

accountRouter = require('./routes/account_route');
server.use('/account', accountRouter);

server.use(cors());
server.set('views', path.join(__dirname, 'views')) // tells express where the views folder is
server.set('view engine', 'ejs')

module.exports = server;