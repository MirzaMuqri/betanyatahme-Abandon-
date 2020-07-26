const express = require('express');
const db = require('../libs/db/db');
const user = require('../libs/user/user');

var router = express.Router();

router.get("/search", function (req, res) {
    res.render("search", {
        username: user.getUserName(req)
    });
});

router.post("/search", function (req, res) {
    db.getUsernameLike(req.body.name, function (results) {
        console.log(results);
        
        res.send(results);
    })
});

module.exports = router;