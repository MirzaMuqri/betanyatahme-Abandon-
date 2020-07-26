const express = require('express');
const db = require('../libs/db/db');
const bcrypt = require('bcrypt');
const user = require('../libs/user/user');

var router = express.Router();

router.get('/login', function (req, res) {
    if (user.isUserLoggedIn(req)) {
        res.redirect("/");
    }
    else {
        var error = req.query.error;
        var username = req.query.username;

        res.render('login', {
            error: error,
            username: username
        });
    }
});

router.get('/logout', function (req, res) {
    if (user.isUserLoggedIn(req)) {
        user.logUserOut(req);

        res.redirect('/login');
    }
    else {
        res.redirect('/');
    }
});

router.post('/login', function (req, res) {
    if (user.isUserLoggedIn(req)) {
        res.redirect('/');
    }
    else {
        var username = req.body.username;
        var password = req.body.password;

        db.isUsernameExists(username, function (results) {
            if (results) {
                db.getUserPassword(username, function (results) {
                    var dbPassword = results;

                    bcrypt.compare(password, dbPassword, function (err, results) {
                        if (results) {
                            db.getIdByUsername(username, function (results) {
                                var userId = results;                                

                                user.logUserIn(username, userId, req);

                                res.send({
                                    redirect: '/'
                                })
                            })
                        }
                        else {
                            res.send({
                                redirect: '/login?error=Error: Username or password is incorrect!'
                            })
                        }
                    });
                });
            }
            else {
                res.send({
                    redirect: '/login?error=Error: Username or password is incorrect!'
                })
            }
        });

    }
});


router.get('/register', function (req, res) {
    if (user.isUserLoggedIn(req)) {
        res.redirect("/");
    }
    else {
        var error = req.query.error;
        var username = req.query.username;
        var email = req.query.email;

        res.render('register', {
            error: error,
            username: username,
            email: email
        });
    }
});

router.post('/register', function (req, res) {
    if (user.isUserLoggedIn(req)) {
        res.redirect("/");
    }
    else {
        var username = req.body.username;
        var email = req.body.email;
        var password = req.body.password;
        var repassword = req.body.repassword;
        var district = req.body.district;
        var error = [];

        // Double check var before executing to DB
        if (username === "" || email === "" || password === "" || repassword === "") {
            error.push("You must fill everything in.");
        }

        if (username.length >= 17 || username.length <= 3) {
            error.push("Username must be between 3-16 charaters.");
        }

        if (/\s/.test(username)) {
            error.push("Username could not contain any spaces.");
        }

        if (!(/^[A-Za-z0-9]+$/.test(username))) {
            error.push("Username could not contains symbols.")
        }

        if (password.length < 6) {
            error.push("Password must be longer than 6.");
        }

        if (/\s/.test(password)) {
            error.push("Password should not contain any spaces.");
        }

        if (!user.isEmailValid(email)) {
            error.push("Email is not valid!");
        }

        if (password !== repassword) {
            error.push("Password didn't match!");
        }

        if (district !== "Kuala Belait" || district !== "Brunei Muara" || district !== "Tutong" || district !== "Temburong") {
            district = "Brunei Muara";
        }

        if (error.length == 0) {
            // No error, checking passes.

            db.isUsernameExists(username, function (results) {
                if (!results) {
                    db.isEmailExists(email, function (results) {
                        if (!results) {
                            let hashedPassword = bcrypt.hashSync(password, 10);

                            db.registerNewUser(username, district, email, hashedPassword);

                            res.send({
                                redirect: "/login?register=success"
                            })
                        }
                        else {
                            // Email already exists
                            res.send({
                                redirect: "/register?error=Error: Email Already Exists&username=" + username + "&email=" + email
                            })
                        }
                    });
                }
                else {
                    // Username exists
                    res.send({
                        redirect: "/register?error=Error: Username Already Exists&username=" + username + "&email=" + email
                    })
                }
            })

        }
        else {
            // Error on something 
            res.send({
                redirect: "/register?error=Error: Something went wrong! Did you do something?!"
            })
        }
    }
});

module.exports = router;