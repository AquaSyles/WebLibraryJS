const { Router } = require('express');
const accountModel = require('./../db/account_model');
const path = require('path');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

accountRouter = Router();

const staticFiles = path.join(__dirname, '..', 'static');

accountRouter.get('/static/css/account.css', (req, res) => {
    res.sendFile(path.join(staticFiles, 'css', 'account.css'));
});

accountRouter.get('/login', (req, res) => {
    res.render('login_page');
});

accountRouter.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (req.user.isAuth) {
        res.status(200).send('Already authenticated');
        return;
    }

    authenticate(username, password)
    .then(user => {
        if (user) {
            token = createToken(user);
            res.cookie('token', token, {maxAge: 3600 * 1000, httpOnly: true, sameSite: 'Strict'});
            res.status(200).send('Valid credentials');

        } else {
            res.status(401).send('Invalid credentials');
        }
    })
});

async function authenticate(username, password) { // returns 0 or user object
    console.log('test')
    const user = await accountModel.select().where('username', '=', username).one();
    console.log(user);
    const hashedPassword = hashPassword(password);
    if (!user) {
        return 0;
    }

    try {
        const authenticPassword = user.password;
        if (authenticPassword === hashedPassword) {
            return {username: username, password: hashedPassword};
        } else {
            return 0;
        }
    } catch (error) {
        console.log('Error:', error);
        return 0;
    }
    
}

function createToken(userObj) {
    let options = {
        algorithm: 'HS256',
        expiresIn: '1h'
    }

    return jwt.sign(userObj, process.env.SECRET_KEY, options);
}

function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

module.exports = accountRouter;