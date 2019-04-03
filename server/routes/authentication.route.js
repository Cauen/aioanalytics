var express = require('express');
var passport = require('passport');
var authRoutes = express.Router();


let Admin = require('../models/Admin');

var sendJSONresponse = function (res, status, content) {
    res.status(status);
    res.json(content);
};

module.exports.login = function (req, res, next) {
    console.log('LOCAL STRATEGY !!' + 'asd');
    //res.send('TEST')
    passport.authenticate('local', function (err, user, info) {
        console.log('LOCAL');
        var token;

        // If Passport throws/catches an error
        if (err) {
            res.status(404).json(err);
            return;
        }

        // If a user is found
        if (user) {
            token = user.generateJwt();
            res.status(200);
            res.json({
                "token": token
            });
        } else {
            // If user is not found1
            res.status(401).json(info);
        }
    })(req, res, next)
};

module.exports.register = function (req, res) {
    var user = new Admin();
    let userName = req.body.username;
    let email = req.body.email;
    let password = req.body.password;

    console.log('Registering');
    user.username = userName;
    user.email = email;

    //user.setPassword(req.body.password);
    user.setPassword(password);

    user.save()
        .then(user => {
            console.log('OK');
            var token;
            token = user.generateJwt();
            res.status(200);
            res.json({
                "token": token
            });
        })
        .catch(err => {
            
            console.log('NOK');
            res.status(400).send(err);
        });

};
