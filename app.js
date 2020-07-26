const express = require('express');
const session = require('express-session');
const bodyPareser = require('body-parser');
const nodeCache = require('node-cache');
const rateLimit = require('express-rate-limit');

// Libs
var db = require('./libs/db/db');

// Rate Limiter (Prevents DOS attacks ish)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 250
});

// Setting up Databases
db.setupDatabase();

var port = 80;

var app = express();
var myCache = new nodeCache({
    stdTTL: 100,
    checkperiod: 120
});

app.set('view engine', 'ejs');

app.use(session({
    secret: "Betanyatah.me by Mukri.xyz",
    resave: true,
    saveUninitialized: true
}));

app.use(express.static(__dirname + "/views"));
app.use(bodyPareser.urlencoded({
    extended: false
}));
app.use(bodyPareser.json());
app.use(limiter);

app.disable('x-powered-by')

app.use('/', require('./routes/homepage'));
app.get('/random-user', require('./routes/homepage'));
app.get('/random-question', require('./routes/homepage'));

app.get('/verified', require('./routes/verified'));

app.get('/settings', require('./routes/settings'));
app.post('/settings', require('./routes/settings'));
app.post('/settings/newimg', require('./routes/settings'));

app.get('/login', require('./routes/auth'));
app.get('/logout', require('./routes/auth'));
app.post('/login', require('./routes/auth'));

app.get('/register', require('./routes/auth'));
app.post('/register', require('./routes/auth'));

app.get('/search', require('./routes/search'));
app.post('/search', require('./routes/search'));

app.get('/u/:username', require('./routes/user'));
app.get('/u/:username/q/:q_id', require('./routes/user'));
app.post('/u/:username/ask', require('./routes/user'));
app.post('/u/:username/ans', require('./routes/user'));
app.post('/u/:username/del', require('./routes/user'));
app.post('/u/:username/delans', require('./routes/user'));
app.post('/u/:username/star', require('./routes/user'));

app.get('/notification', require('./routes/bell'));
app.post('/notification', require('./routes/bell'));

app.get('*', function (req, res) {
    res.render('404');
})

// Error Handler
app.use(function (err, req, res, next) {
    res.locals.message = err.message;

    res.status(err.status || 500);    
    res.redirect('back');
})

app.listen(port);
console.log("Server is running on port: " + port);
