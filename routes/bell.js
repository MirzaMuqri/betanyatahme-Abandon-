const express = require('express');
const moment = require('moment');
const user = require('../libs/user/user');
const db = require('../libs/db/db');

var router = express.Router();

router.get('/notification', function (req, res) {

    if (user.isUserLoggedIn(req)) {

        db.getNotifications(user.getUserId(req), 0, 10, function (bell) {
            
            res.render('bell', {
                cat: "bell",
                username: user.getUserName(req),
                bell: bell,
                moment: moment
            });
        });
    }
    else {
        res.redirect('/login');
    }
});

router.post('/notification', function (req, res) {
    if (user.isUserLoggedIn(req)) {
        db.getNotifications(user.getUserId(req), parseInt(req.body.offset), 10, function (data) {
            
            if (data.length >= 1) {
                data[0].name = user.getUserName(req);
            }

            res.send(data);
        });
    }
    else {
        res.send("fail");
    }
});

module.exports = router;