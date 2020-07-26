exports.logUserIn = function (username, id, req) {
    req.session.login = true;
    req.session.user_id = id;
    req.session.user_name = username.toLowerCase();
}

exports.logUserOut = function (req) {
    req.session.destroy();
}

exports.getUserId = function (req) {
    return req.session.user_id;
}

exports.getUserName = function (req) {
    return req.session.user_name;
}

exports.setUsername = function (username, req) {
    req.session.user_name = username.toLowerCase();
}

exports.isUserLoggedIn = function (req) {
    return req.session.login;
}

// IF THIS DOESNT WORK, MAKE SURE ALL OF THE USERNAME ARE LOWERED CASED
exports.isUserTheSameWithLoggedIn = function (user_id, username, req) {
    if (!req.session.user_name) {
        return false;
    }    

    var sessionName = req.session.user_name.toString().toLowerCase();

    if (sessionName == username && req.session.user_id == user_id) {        
        return true;
    }

    return false;
}

exports.addAskCooldown = function (req) {
    let millis = (Date.now() / 1000) + 10;
    req.session.ask_cooldown = millis;
}

exports.isAskCooldown = function (req) {
    let millis = Date.now() / 1000;

    if (!req.session.ask_cooldown) {
        return false
    }

    if (req.session.ask_cooldown > millis) {
        return true;
    }

    return false;
}

exports.isEmailValid = function (email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}