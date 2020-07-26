const express = require('express');
const moment = require('moment');
const user = require('../libs/user/user');
const db = require('../libs/db/db');

var router = express.Router();

router.get('/u/:username', function (req, res) {
    var username = req.params.username;

    db.isUsernameExists(username, function (exists) {
        if (exists) {

            var ask = "Error: " + req.query.ask;
            var hide = req.query.hide;

            db.getUserInformations(username, function (userInfo) {
                var userId = userInfo[0].user_id;
                var userName = userInfo[0].user_name.toLowerCase();

                var isUserLoggedTheSame = user.isUserTheSameWithLoggedIn(userId, userName, req);

                db.getUserQuestions(userId, function (userQ) {
                    res.render('profile', {
                        user_data: userInfo[0],
                        userQ: userQ,
                        ask: ask,
                        hide: hide,
                        moment: moment,
                        isUser: isUserLoggedTheSame,
                        username: user.getUserName(req),
                        cat: "profile"
                    });
                });
            });
        }
        else {
            res.redirect('/404');
        }
    });
});

router.post('/u/:username/ask', function (req, res) {
    var username = req.params.username;

    if (!user.isAskCooldown(req)) {
        db.isUsernameExists(username, function (exists) {
            if (exists) {
                var questions = req.body.questions;

                db.getIdByUsername(username, function (userId) {
                    db.addNewQuestions(questions, userId);

                    user.addAskCooldown(req);

                    res.send("pass");

                });
            }
            else {
                res.send("fail");
            }
        });
    }
    else {
        res.send("fail");
    }
});

router.post('/u/:username/delans', function (req,res) {
    var username = req.params.username;
    var q_id = req.body.id;

    if (user.isUserLoggedIn(req)) {
        db.isUsernameExists(username, function (exists) {
            if (exists) {
                db.getIdByUsername(username, function (user_id) {
                    if (user.isUserTheSameWithLoggedIn(user_id, username.toLowerCase(), req)) {
                        db.isPostOwnerUser(q_id, user_id, function (owner) {
                            if (owner) {
                                db.removeAnswer(q_id, user_id);

                                res.send("pass");
                            }
                            else {
                                res.send("fail1");
                            }
                        });
                    }
                    else {
                        res.send("fail2");
                    }
                });
            }
            else {
                res.send("fail3");
            }
        })
    }
    else {
        res.send("fail4");   
    }
});

router.post('/u/:username/ans', function (req, res) {
    var username = req.params.username;
    var q_id = req.body.id;
    var answers = req.body.answers;

    if (user.isUserLoggedIn(req)) {
        db.isQuestionsExists(q_id, function (exists) {
            if (exists) {
                db.isUsernameExists(username, function (exists) {
                    if (exists) {
                        db.getIdByUsername(username, function (user_id) {
                            if (user.isUserTheSameWithLoggedIn(user_id, username.toLowerCase(), req)) {
                                db.isPostOwnerUser(q_id, user.getUserId(req), function (owner) {
                                    if (owner) {

                                        db.getAnswers(q_id, function (ans) {
                                            if (ans.length == 0) {                                                
                                                db.addAnswer(user_id, q_id, answers);

                                                res.send("pass");
                                            }
                                            else {
                                                res.send("fail1");   
                                            }
                                        })

                                    }
                                    else {
                                        res.send("fail2");
                                    }
                                });
                            }
                            else {
                                res.send("fail3");
                            }
                        })
                    }
                    else {
                        res.send("fail4");
                    }
                })
            }
            else {
                res.send("fail5");
            }
        })
    }
    else {
        res.send("fail6");
    }

})

router.post('/u/:username/del', function (req, res) {
    var username = req.params.username.toString().toLowerCase();

    if (user.isUserLoggedIn(req)) {
        if (user.isUserTheSameWithLoggedIn(user.getUserId(req), username.toLowerCase(), req)) {
            var q_id = req.body.id;

            db.isPostOwnerUser(q_id, user.getUserId(req), function (results) {
                db.isQuestionsExists(q_id, function (exists) {
                    if (exists) {
                        db.removeQuestions(q_id, user.getUserId(req));
                        res.send("pass");
                    }
                    else {
                        res.send("fail1");
                    }
                });
            });
        }
        else {
            res.send("fail2");
        }
    }
    else {
        res.send("fail3");
    }
});

router.post('/u/:username/star', function (req, res) {
    var username = req.params.username;
    var q_id = req.body.id;

    db.isQuestionsExists(q_id, function (post_exists) {
        if (post_exists) {
            db.isUsernameExists(username, function (exists) {
                if (exists) {
                    db.getIdByUsername(username, function (userId) {

                        db.likeQuestions(userId, q_id, req.ip, function (pass) {
                            if (pass) {
                                res.send("pass")
                            }
                            else {
                                res.send("fail3");
                            }
                        })
                    });
                }
                else {
                    res.send("fail2");
                }
            });
        }
        else {
            res.send("fail1");
        }
    });
});

router.get('/u/:username/q/:q_id', function (req, res) {
    var username = req.params.username;
    var q_id = req.params.q_id;

    if (isNaN(q_id)) {
        res.redirect('/404');
        return;
    }

    db.isUsernameExists(username, function (exists) {
        if (exists) {

            db.getIdByUsername(username, function (user_id) {
                db.getQuestions(user_id, q_id, function (results) {

                    var isUserLoggedTheSame = user.isUserTheSameWithLoggedIn(user_id, username.toLowerCase(), req);

                    if (results.length >= 1) {

                        if (results[0].q_answered == 1) {

                            db.getAnswers(q_id, function (answers) {

                                res.render("view-questions", {
                                    username: user.getUserName(req),
                                    ans: answers[0],
                                    info: results[0],
                                    moment: moment,
                                    isUser: isUserLoggedTheSame,
                                    username: user.getUserName(req)
                                });
                            });
                        }
                        else {
                            res.render("view-questions", {
                                username: user.getUserName(req),
                                info: results[0],
                                moment: moment,
                                ans: [],
                                isUser: isUserLoggedTheSame
                            });
                        }
                    }
                    else {
                        res.redirect('/404')
                    }
                });
            });
        }
        else {
            res.redirect('/404');
        }
    })


});

module.exports = router;