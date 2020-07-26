const mysql = require('mysql');
const mailer = require('nodemailer');

var pool = mysql.createPool({
    connectionLimit: 10,
    host: "localhost",
    user: "root",
    password: "",
    database: "betanyatah",
    charset : 'utf8mb4'
});

exports.setupDatabase = function () {
    pool.getConnection(function (err, con) {
        if (err) {
            console.log("Error in setupDatabase: " + err);
        }
        else {
            console.log("Creating database if not exist.....");

            con.query("CREATE TABLE IF NOT EXISTS `betanya_user` (`user_id` INTEGER AUTO_INCREMENT, `user_name` VARCHAR(255) NOT NULL, `user_district` VARCHAR(255) NOT NULL, `user_email` VARCHAR(255) NOT NULL, `user_password` TEXT NOT NULL, `user_datejoin` VARCHAR(255) NOT NULL, `user_profilepic` VARCHAR(255) NOT NULL, `user_verified` INTEGER NOT NULL, `user_stars` INTEGER NOT NULL, `user_questions` INTEGER NOT NULL, `user_answer` INTEGER NOT NULL, `user_verified_token` VARCHAR(255) NOT NULL, `user_email_verified` INTEGER NOT NULL, PRIMARY KEY (`user_id`), UNIQUE (`user_id`))");

            con.query("CREATE TABLE IF NOT EXISTS `betanya_questions` (`q_id` INTEGER AUTO_INCREMENT, `q_questions` TEXT NOT NULL, `user_id` INTEGER NOT NULL, `q_time` VARCHAR(255) NOT NULL, `q_star` INTEGER NOT NULL, `q_answered` INTEGER NOT NULL, PRIMARY KEY (`q_id`), UNIQUE (`q_id`))");
            con.query("CREATE TABLE IF NOT EXISTS `betanya_answer` (`ans_id` INTEGER AUTO_INCREMENT, `q_id` INTEGER NOT NULL, `ans_answer` TEXT NOT NULL, `ans_time` VARCHAR(255) NOT NULL, PRIMARY KEY (`ans_id`), UNIQUE (`ans_id`))");

            con.query("CREATE TABLE IF NOT EXISTS `betanya_bell` (`bell_id` INTEGER AUTO_INCREMENT, `bell_type` INTEGER NOT NULL, `bell_time` VARCHAR(255) NOT NULL, `user_id` INTEGER NOT NULL, `bell_notifier` INTEGER NOT NULL, `q_id` INTEGER NOT NULL, PRIMARY KEY (`bell_id`), UNIQUE (`bell_id`))");

            con.query("CREATE TABLE IF NOT EXISTS `betanya_like_tracker` (`lt_id` INTEGER AUTO_INCREMENT, `lt_ip` VARCHAR(255) NOT NULL, `q_id` INTEGER NOT NULL, PRIMARY KEY (`lt_id`), UNIQUE (`lt_id`))");

            //ALTER TABLE Tablename CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_bin
            
            con.release();
        }
    })
}

// Users Related
exports.getUsernameById = function (user_id, callback) {
    pool.getConnection(function (err, con) {
        if (err) {
            console.log("Error on getUsernameById: " + err);
        }
        else {
            con.query("SELECT `user_name` FROM `betanya_user` WHERE `user_id` = ?",
                [user_id],
                function(err, results) {
                    if (err) {
                        console.log("Error on getUsernameById on SELECT: " + err);
                    }

                    callback(results);
                });

            con.release();
        }
    });
}

exports.getHowManyUser = function (callback) {
    pool.getConnection(function (err, con) {
        if (err) {
            console.log("Error on getHowManyUser: " + err);
        }
        else {
            con.query("SELECT `user_id` FROM `betanya_user` ORDER BY `user_id` DESC LIMIT 1",
                function (err, results) {
                    if (err) {
                        console.log("Error on getHowManyUser on SELECT: " + err);
                    }

                    callback(results);
                });

            con.release();
        }
    });
}

exports.changeProfilePic = function (u_id, profilepic) {
    pool.getConnection(function (err, con) {
        if (err) {
            console.log("Error on changeProfilePic: " + err);
        }
        else {
            con.query("UPDATE `betanya_user` SET `user_profilepic` = ? WHERE `user_id` = ?",
                [profilepic, u_id]);

            con.release();
        }
    });
}
exports.changeEmail = function (u_id, email) {
    pool.getConnection(function (err, con) {
        if (err) {
            console.log("Error on changeEmail: " + err);
        }
        else {
            con.query("UPDATE `betanya_user` SET `user_email` = ? WHERE `user_id` = ?",
                [email, u_id]);

            con.release();
        }
    });
}

exports.changePassword = function (u_id, password) {
    pool.getConnection(function (err, con) {
        if (err) {
            console.log("Error on changePassword: " + err);
        }
        else {
            con.query("UPDATE `betanya_user` SET `user_password` = ? WHERE `user_id` = ?",
                [password, u_id]);

            con.release();
        }
    });
}

exports.changeUsername = function (username, u_id) {
    pool.getConnection(function (err, con) {
        if (err) {
            console.log("Error on changeUsername: " + err);
        }
        else {
            con.query("UPDATE `betanya_user` SET `user_name` = ? WHERE `user_id` = ?",
                [username, u_id]);

            con.release();
        }
    });
}

exports.registerNewUser = function (username, district, email, password) {
    pool.getConnection(function (err, con) {
        if (err) {
            console.log("Error on registerNewUser: " + err);
        }
        else {
            var verified_token = "";

            // Generate random tokens
            var charset = "ABCDEFGHIJKLMNOPQRSTUVabcdefghijklmnopqrstuvwxyz0123456789";

            for (var i = 0; i < 20; i++) {
                verified_token += charset.charAt(Math.floor(Math.random() * charset.length));
            }

            con.query("INSERT INTO `betanya_user` (`user_name`, `user_district`, `user_email`, `user_password`, `user_datejoin`, `user_profilepic`, `user_verified`, `user_stars`, `user_questions`, `user_answer`, `user_verified_token`, `user_email_verified`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
                [username, district, email, password, Date.now(), 'default.jpg', 0, 0, 0, 0, verified_token, 0],
                function (err, results) {
                    if (err) {
                        console.log("Error on registerNewUser in INSERT: " + err);
                    }

                    // Send email


                    con.release();
                });
        }
    });
}

exports.getUsernameLike = function (username, callback) {
    pool.getConnection(function (err, con) {
        if (err) {
            console.log("Error on getUsernameLike: " + err);
        }
        else {
            con.query("SELECT `user_name`, `user_profilepic` FROM `betanya_user` WHERE `user_name` LIKE ?",
                ["%" + username + "%"],
                function (err, results) {
                    if (err) {
                        console.log("Error on getUsernameLike on SELECT: " + err);
                    }

                    callback(results);
                });

            con.release();
        }
    })
}

exports.isUsernameExists = function (username, callback) {
    pool.getConnection(function (err, con) {
        if (err) {
            console.log("Error on isUsernameExists: " + err);
        }
        else {
            con.query("SELECT `user_name` FROM `betanya_user` WHERE `user_name` = ?",
                [username],
                function (err, results) {
                    if (results.length >= 1) {
                        callback(true);
                    }
                    else {
                        callback(false);
                    }
                });

            con.release();
        }
    });
}

exports.isEmailExists = function (email, callback) {
    pool.getConnection(function (err, con) {
        if (err) {
            console.log("Error on isEmailExists: " + err);
        }
        else {
            con.query("SELECT `user_email` FROM `betanya_user` WHERE `user_email` = ?",
                [email],
                function (err, results) {
                    if (results.length >= 1) {
                        callback(true);
                    }
                    else {
                        callback(false);
                    }
                });

            con.release();
        }
    });
}

exports.getUserPassword = function (username, callback) {
    pool.getConnection(function (err, con) {
        if (err) {
            console.log("Error on getUserPassword: " + err);
        }
        else {
            con.query("SELECT `user_password` FROM `betanya_user` WHERE `user_name` = ?",
                [username],
                function (err, results) {

                    if (results.length >= 1) {
                        callback(results[0].user_password);
                    }
                    else {
                        callback(null);
                    }
                });

            con.release();
        }
    });
}

exports.getIdByUsername = function (username, callback) {
    pool.getConnection(function (err, con) {
        if (err) {
            console.log("Error on getIdByUsername: " + err);
        }
        else {
            con.query("SELECT `user_id` FROM `betanya_user` WHERE `user_name` = ?",
                [username],
                function (err, results) {

                    if (err) {
                        console.log("Error on getIdByUsername in SELECT: " + err);
                    }

                    callback(results[0].user_id);

                    con.release();
                });
        }
    });
}

exports.getRegisteredAmt = function (callback) {
    pool.getConnection(function (err, con) {
        if (err) {
            console.log("Error on getRegisteredAmt: " + err);
        }
        else {
            con.query("SELECT `user_id` FROM `betanya_user` ORDER BY `user_id` DESC LIMIT 1",
                function (err, results) {
                    if (err) {
                        console.log("Error on getRegisteredAmt on SELECT: " + err);
                    }

                    callback(results);
                });

            con.release();
        }
    });
}

// HOMEPAGE RELATED
exports.getTop3Users = function (callback) {
    pool.getConnection(function (err, con) {
        if (err) {
            console.log("Error on getTop3Users: " + err);
        }
        else {
            con.query("SELECT `user_id`, `user_questions`, `user_profilepic`, `user_name`, `user_verified` FROM `betanya_user` ORDER BY `user_questions` DESC LIMIT 3",
                function (err, results) {
                    if (err) {
                        console.log("Error on getTop3Users in SELECT: " + err);
                    }

                    callback(results);
                });

            con.release();
        }
    });
}

exports.getUserQuestions = function (userID, callback) {
    pool.getConnection(function (err, con) {
        if (err) {
            console.log("Error on getUserQuestions: " + err);
        }
        else {
            con.query("SELECT `q_id`, `q_questions`, `q_time` FROM `betanya_questions` WHERE `user_id` = ? ORDER BY `q_id` DESC",
                [userID],
                function (err, results) {
                    if (err) {
                        console.log("Error on getUserQuestions in SELECT: " + err);
                    }

                    callback(results);

                    con.release();
                });
        }
    });
}

// PROFILE RELATED
exports.getUserInformations = function (username, callback) {
    pool.getConnection(function (err, con) {
        if (err) {
            console.log("Error on getUserInformations: " + err);
        }
        else {
            con.query("SELECT `user_id`, `user_email`,`user_name`, `user_verified`, `user_profilepic`, `user_answer`, `user_stars`, `user_questions` FROM `betanya_user` WHERE `user_name` = ?",
                [username],
                function (err, results) {
                    if (err) {
                        console.log("Error on getUserInformations on SELECT: " + err);
                    }

                    callback(results);
                });

            con.release();
        }
    });
}

// QUESTIONS RELATED
exports.getHowManyQuestions = function (callback) {
    pool.getConnection(function (err, con) {
        if (err) {
            console.log("Error on getHowManyQuestions: " + err);
        }
        else {
            con.query("SELECT `q_id`, `user_id` FROM `betanya_questions` ORDER BY `q_id` DESC LIMIT 1",
                function (err, results) {
                    if (err) {
                        console.log("Error on getHowManyQuestions on SELECT: " + err);
                    }

                    callback(results);
                });

            con.release();
        }
    });
}

exports.removeAnswer = function (q_id, u_id) {
    pool.getConnection(function (err, con) {
        if (err) {
            console.log("Error on removeAnswer: " + err);
        }
        else {
            con.query("UPDATE `betanya_questions` SET `q_answered` = 0 WHERE `q_id` = ?",
                [q_id], function (err, results) {
                    if (err) {
                        console.log("Error in removeAnswer ON UPDATE: " + err);
                    }
                });

            con.query("DELETE FROM `betanya_answer` WHERE `q_id` = ?",
                [q_id], function (err, results) {
                    if (err) {
                        console.log("Error in removeAnswer ON DELETE: " + err);
                    }
                });

            con.query("UPDATE `betanya_user` SET `user_answer` = `user_answer` - 1 WHERE `user_id` = ?",
                [u_id], function (err, results) {
                    if (err) {
                        console.log("Error in removeAnswer ON UPDATE2: " + err);
                    }
                });

            con.release();
        }
    })
}

exports.addAnswer = function (u_id, q_id, answer) {
    pool.getConnection(function (err, con) {
        if (err) {
            console.log("Error on addAnswers: " + err);
        }
        else {
            con.query("INSERT INTO `betanya_answer` (`q_id`, `ans_answer`, `ans_time`) VALUES (?,?,?)",
                [q_id, answer, Date.now()]);

            con.query("UPDATE `betanya_questions` SET `q_answered` = 1 WHERE `q_id` = ?",
                [q_id]);

            con.query("UPDATE `betanya_user` SET `user_answer` = `user_answer` + 1 WHERE `user_id` = ?",
                [u_id])

            con.release();
        }
    });
}

exports.getAnswers = function (q_id, callback) {
    pool.getConnection(function (err, con) {
        if (err) {
            console.log("Error on getAnswers: " + err);
        }
        else {
            con.query("SELECT * FROM `betanya_answer` WHERE `q_id` = ?",
                [q_id],
                function (err, results) {
                    if (err) {
                        console.log("Error on getAnswer on SELECT: " + err);
                    }

                    callback(results);
                });

            con.release();
        }
    });
}

exports.getQuestions = function (user_id, q_id, callback) {
    pool.getConnection(function (err, con) {
        if (err) {
            console.log("Error on getQuestions: " + err);
        }
        else {
            con.query("SELECT u.user_name, u.user_profilepic, u.user_verified, q.* FROM `betanya_questions` AS q INNER JOIN `betanya_user` AS u ON u.user_id = q.user_id WHERE q.q_id = ? AND q.user_id = ?",
                [q_id, user_id],
                function (err, results) {
                    if (err) {
                        console.log("Error on getQuestions on SELECT: " + err);
                    }

                    callback(results);
                });

            con.release();
        }
    });
}

exports.isQuestionsExists = function (q_id, callback) {
    pool.getConnection(function (err, con) {
        if (err) {
            console.log("Error on isQuestionsExists: " + err);
        }
        else {
            con.query("SELECT `q_id` FROM `betanya_questions` WHERE `q_id` = ?",
                [q_id],
                function (err, results) {
                    if (err) {
                        console.log("Error on isQuestionsExists on SELECT: " + err);
                    }

                    if (results.length >= 1) {
                        callback(true);
                    }
                    else {
                        callback(false);
                    }
                });

            con.release();
        }
    });
}

exports.addNewQuestions = function (questions, user_id) {
    pool.getConnection(function (err, con) {
        if (err) {
            console.log("Error on addNewQuestions: " + err);
        }
        else {
            con.query("INSERT INTO `betanya_questions` (`q_questions`, `user_id`, `q_time`, `q_star`, `q_answered`) VALUES (?,?,?,?,?)",
                [questions, user_id, Date.now(), 0, 0],
                function (err, results) {
                    if (err) {
                        console.log("Error on addNewQuestions on INSERT: " + err);
                    }

                    con.query("INSERT INTO `betanya_bell` (`bell_type`, `bell_time`, `user_id`, `bell_notifier`, `q_id`) VALUES (?,?,?,?,?)",
                        [1, Date.now(), user_id, 0, results.insertId],
                        function (err, results) {
                            if (err) {
                                console.log("Error on addNewQuestions on INSERT BELL: " + err);
                            }
                        });
                });

            con.query("UPDATE `betanya_user` SET `user_questions` = `user_questions` + 1 WHERE `user_id` = ?",
                [user_id],
                function (err, results) {
                    if (err) {
                        console.log("Error on addNewQuestions on UPDATE: " + err);
                    }
                });

            con.release();
        }
    });
}

exports.removeQuestions = function (q_id, u_id) {
    pool.getConnection(function (err, con) {
        if (err) {
            console.log("Error on removeQuestions: " + err);
        }
        else {
            con.query("SELECT `q_answered` FROM `betanya_questions` WHERE `q_id` = ?",
                [q_id],
                function (err, results) {
                    if (err) {
                        console.log("Error on removeQuestions: " + err);
                    }

                    con.query("DELETE FROM `betanya_questions` WHERE `q_id` = ?",
                        [q_id],
                        function (err, results) {
                            if (err) {
                                console.log("Error on removeQuestions on DELETE: " + err);
                            }
                        });

                    con.query("DELETE FROM `betanya_bell` WHERE `q_id` = ? AND `bell_type` = 1",
                        [q_id],
                        function (err, results) {
                            if (err) {
                                console.log("Error on removeQuestions on DELETE: " + err);
                            }
                        })

                    if (results[0].q_answered == 1) {
                        con.query("UPDATE `betanya_user` SET `user_questions` = `user_questions` - 1, `user_answer` = `user_answer` - 1 WHERE `user_id` = ?",
                            [u_id], function (err, results) {
                                if (err) {
                                    console.log("Error on removeQuestions on UPDATE TOP: " + err);
                                }
                            });
                    }
                    else {
                        con.query("UPDATE `betanya_user` SET `user_questions` = `user_questions` - 1 WHERE `user_id` = ?",
                            [u_id], function (err, results) {
                                if (err) {
                                    console.log("Error on removeQuestions on UPDATE BOTTOM: " + err);
                                }
                            });
                    }

                    con.release();
                });
        }
    });
}

exports.isPostOwnerUser = function (q_id, u_id, callback) {
    pool.getConnection(function (err, con) {
        if (err) {
            console.log("Error on isPostOwnerUser: " + err);
        }
        else {
            con.query("SELECT `q_id` FROM `betanya_questions` WHERE `user_id` = ? AND `q_id` = ?",
                [u_id, q_id],
                function (err, results) {
                    if (results.length >= 1) {
                        callback(true);
                    }
                    else {
                        callback(false);
                    }

                });

            con.release();
        }
    });
}

//NOTIFICATION RELATED
exports.getNotifications = function (u_id, offset, limit, callback) {
    pool.getConnection(function (err, con) {
        if (err) {
            console.log("Error on getNotifications: " + err);
        }
        else {
            //"SELECT bell.*, user.user_name FROM betanya_bell AS bell INNER JOIN betanya_user AS user WHERE bell.user_id = ? ORDER BY bell.bell_id DESC LIMIT ? "
            con.query("SELECT * FROM `betanya_bell` WHERE `user_id` = ? ORDER BY `bell_id` DESC LIMIT ?, ?",
                [u_id, offset, limit],
                function (err, results) {
                    if (err) {
                        console.log("Error on getNotifications on SELECT: " + err);
                    }
                    callback(results);
                });

            con.release();
        }
    });
}

// LIKE RELATED
exports.likeQuestions = function (u_id, q_id, u_ip, callback) {
    pool.getConnection(function (err, con) {
        if (err) {
            console.log("Error on likeQuestions: " + err);
            callback(false);
        }
        else {
            con.query("SELECT * FROM `betanya_like_tracker` WHERE `q_id` = ? AND `lt_ip` = ?",
                [q_id, u_ip],
                function (err, results) {

                    if (results.length <= 0) {

                        con.query("INSERT INTO `betanya_like_tracker` (`lt_ip`, `q_id`) VALUES (?,?)",
                            [u_ip, q_id], function (err, results) {
                                if (err) {
                                    console.log("INSERT 1 :  " + err);
                                }
                            });

                        con.query("UPDATE `betanya_questions` SET `q_star` = `q_star` + 1 WHERE `q_id` = ?",
                            [q_id], function (err, results) {
                                if (err) {
                                    console.log("UPDATE 1 :  " + err);
                                }
                            });

                        con.query("UPDATE `betanya_user` SET `user_stars` = `user_stars` + 1 WHERE `user_id` = ?",
                            [u_id], function (err, results) {
                                if (err) {
                                    console.log("UPDATE 2 :  " + err);
                                }
                            });

                        con.query("INSERT INTO `betanya_bell` (`bell_type`, `bell_time`, `user_id`, `bell_notifier`, `q_id`) VALUES (?,?,?,?,?)",
                            [0, Date.now(), u_id, 0, q_id], function (err, results) {
                                if (err) {
                                    console.log("INSERT 2 :  " + err);
                                }
                            });

                        callback(true);
                    }
                    else {
                        callback(false);
                    }
                });

            con.release();
        }
    });
}