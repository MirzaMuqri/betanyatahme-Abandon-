const express = require('express');
const moment = require('moment');
const user = require('../libs/user/user');
const db = require('../libs/db/db');

var router = express.Router();

router.get('/', function (req, res) {
  if (user.isUserLoggedIn(req)) {

    db.getUserInformations(user.getUserName(req), function (user_data) {
      db.getNotifications(user.getUserId(req), 0, 3, function (bell) {
        
        res.render("homepage", {
          user_data: user_data[0],
          bell: bell,
          moment: moment,
        });

      });
    });

  }
  else {
    res.redirect('/login');
  }
});

router.get('/random-user', function (req, res) {
  if (user.isUserLoggedIn(req)) {
    db.getHowManyUser(function (user_amt) {
      var max_user = user_amt[0].user_id;
      var results = Math.round(Math.random() * (max_user - 1) + 1);

      db.getUsernameById(results, function (results) {
        var username = results[0].user_name;
        
        res.redirect('/u/' + username);
      });

    });
  }
  else {
    res.redirect('/login');
  }
});

router.get('/random-question', function (req, res) {
  if (user.isUserLoggedIn(req)) {
    db.getHowManyQuestions(function (q_amt) {
      var max_user = q_amt[0].q_id;
      var results = Math.round(Math.random() * (max_user - 1) + 1);

      db.getUsernameById(q_amt[0].user_id, function (username) {
        var username = username[0].user_name;

        res.redirect('/u/' + username + "/q/" + results);
      });

    })
  }
  else {
    res.redirect('/');
  }
});

module.exports = router;