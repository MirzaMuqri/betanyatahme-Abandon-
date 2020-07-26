const express = require('express');
const db = require('../libs/db/db');
const user = require('../libs/user/user');
const bcrypt = require('bcrypt');
const multer = require('multer');

var router = express.Router();

const multerConfig = {
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, './views/img/profile-pic')
        },
        filename: function (req, file, cb) {
            var r = Math.random().toString(36).substr(2, 20);
            cb(null, r + "-" + Date.now() + '.jpg');
        },
    }),
    fileFilter: function (req, file, next) {
        if (!file) { next(); };

        const imgName = file.mimetype.startsWith('image/');

        if (imgName) {
            const ext = file.mimetype.split('/')[1];
            
            if (ext == 'gif') {
                next({ message: "File Type are not supported! Only .png and .jpg"})
            }
            else {
                next(null, true);
            }
        }
    }
}

/* var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './views/img/profile-pic')
    },
    filename: function (req, file, cb) {
        var r = Math.random().toString(36).substr(2, 20);
        cb(null, r + "-" + Date.now() + '.jpg');
    },
})

var upload = multer({
    fileFilter: function (req, file, cb) {
        console.log("file size: " + file.fileSize);
        
        if (file.mimetype !== 'image/png' || file.mimetype !== 'image/jpeg') {
            req.fileValidationErr = 'Error';

            return cb(null, false);
        } else {
            cb(null, true);
        }
    },
    limits: {
        fileSize: '5mb'
    },
    storage: storage
});*/

router.get('/settings', function (req, res) {
    if (user.isUserLoggedIn(req)) {
        db.getUserInformations(user.getUserName(req), function (u_info) {

            res.render("settings", {
                username: u_info[0].user_name,
                email: u_info[0].user_email,
            });

        })
    }
    else {
        res.redirect('/');
    }
});

router.post('/settings/newimg', multer(multerConfig).single('photo'), function (req, res) {
    if (user.isUserLoggedIn(req)) {
        
        db.changeProfilePic(user.getUserId(req), req.file.filename);

        res.redirect('back');
    }
});

router.post('/settings', function (req, res) {
    if (user.isUserLoggedIn(req)) {
        var cat = req.body.type;
        var data = req.body.datas;

        if (cat === "username") {
            if (data.toLowerCase() === user.getUserName(req)) {
                // User want to change username caps

                db.changeUsername(data, user.getUserId(req));

                res.send("pass");
            }
            else {
                db.isUsernameExists(data, function (exists) {
                    if (exists) {
                        res.send("user-exist");
                    }
                    else {
                        db.changeUsername(data, user.getUserId(req));
                        user.setUsername(data, req);

                        res.send("pass");
                    }
                })
            }
        }
        else if (cat === "password") {
            let hashedPassword = bcrypt.hashSync(data, 10);

            db.changePassword(user.getUserId(req), hashedPassword);

            res.send("pass");
        }
        else if (cat === "email") {
            db.isEmailExists(data, function (exists) {
                if (exists) {
                    res.send("email-exist");
                }
                else {
                    db.changeEmail(user.getUserId(req), data);

                    res.send("pass");
                }
            });
        }
        else if (cat === "pic") {
            db.changeProfilePic(user.getUserId(req), req.file.filename);

            res.send("pass");
        }
    }
    else {
        res.send("fail");
    }
});

module.exports = router;