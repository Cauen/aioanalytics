const express = require('express');
const app = express();
const userRoutes = express.Router();
var ObjectId = require('mongodb').ObjectID;

let User = require('../models/User');

module.exports.addUser = (function (req, res) {
    let user = new User({username: 'n36lm0bef178bem6h86fhn'});
    user.setPassword('123321');
    console.log('Adding user');
    //let user = new User(req.body);
    user.save()
        .then(user => {
            res.status(200).json({ 'user': 'user in added successfully' });
        })
        .catch(err => {
            res.status(400).send(err);
        });
});

