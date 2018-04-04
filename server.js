const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();

const config = {
    database: 'mongodb://127.0.0.1:27017/calendar_events_db',
    port: process.env.PORT || 8080,
    secret: 'verysecretkey'
};

mongoose.connect(config.database);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

const userScheme = new mongoose.Schema({
    email: String,
    password: String,
    events: Array
});

const User = mongoose.model('User', userScheme);

app.get('/api/events/events-list', verifyToken, (req, res) => {
    jwt.verify(req.token, config.secret, (err, authData) => {
        if (err) {
            res.sendStatus(403);
        } else {
            User.findOne({'email': authData.email}, function (err, user) {
                if (err) {
                    res.sendStatus(403);
                } else {
                    res.json(user.events);
                }
            });
        }
    });
});

app.post('/api/events/add', verifyToken, (req, res) => {
    jwt.verify(req.token, config.secret, (err, authData) => {
        if (err) {
            res.sendStatus(403);
        } else {
            User.update(
                { email: authData.email },
                { $push: { events: req.body } }, function (err) {
                    if (err) console.log(err);
                }
            );
            res.sendStatus(200);
        }
    });
});

app.post('/api/events/delete', verifyToken, (req, res) => {
    jwt.verify(req.token, config.secret, (err, authData) => {
        if (err) {
            res.sendStatus(403);
        } else {
            User.update(
                { email: authData.email },
                { $pull: { events: req.body } }, function (err) {
                    if (err) console.log(err);
                }
            );
            res.sendStatus(200);
        }
    });
});

app.post('/api/login', (req, res) => {

    let newUser = new User({email: req.query.email, password: req.query.password});

    User.findOne({'email': req.query.email}, function (err, user) {
        if (err) {
            throw new Error(err);
        } else if (user === null) { // if user doesn't exist create him
            newUser.save(function(err, doc){
                if (err) throw new Error(err);
                else {
                    jwt.sign({email: req.query.email, password: req.query.password}, config.secret, {expiresIn: '30d'}, (err, token) => {
                        res.setHeader('x-token', token);
                        res.sendStatus(200);
                    });
                }
            });
        } else if (user.password !== req.query.password) { // if user exist check password
            res.sendStatus(401);
        } else { // if user exist send token
            jwt.sign({email: req.query.email, password: req.query.password}, config.secret, {expiresIn: '30d'}, (err, token) => {
                res.setHeader('x-token', token);
                res.sendStatus(200);
            });
        }
    });
});

function verifyToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];
    // Check if bearer is undefined
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    } else {
        res.sendStatus(403);
    }

}

app.listen(config.port, () => console.log(`Server launched on port ${config.port}`));