const express = require('express')
const server = express();
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');

server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(cookieParser());

accountRouter = require('./routes/account_route');
server.use('/account', accountRouter);

server.use(cors());
server.set('views', path.join(__dirname, 'views')) // tells express where the views folder is
server.set('view engine', 'ejs')

module.exports = server;