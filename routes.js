const passport = require('passport');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const path = require('path');

module.exports = function (app, db) {
    function ensureAuthenticated(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        res.redirect('/');
    }

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));


    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname+'/client/build/index.html'));
    });

    app.post('/login', passport.authenticate('local', { failureRedirect: '/'}, (req, res) => {
        res.redirect('/');
    }));

    // 100 success; 101 invalid email; 102 invalid username; 103 invalid password
    // 104 email taken; 105 username taken; 106 database error
    // 107 login failed
    app.post('/signup/first', (req, res) => {
        let email = req.body.email;
        if (email.indexOf('@') === -1) {
            res.json('101');
        } else {
            db.collection('users').findOne( {email: email}, (err, user) => {
                if (err) {
                    console.log(err);
                } else if (user) {
                    res.json('104');
                } else {
                    res.json('100');
                }
            })
        }
    });
    app.post('/signup/second', (req, res) => {
        let email = req.body.email;
        let username = req.body.username;
        let password = req.body.password;
        if (email.indexOf('@') === -1) {
            res.json('101');
            return;
        }
        if ((/^\s*$/).test(username) || username.length > 20 && username.length < 3) {
            res.json('102');
            return;
        }
        if (password.length < 8 || password.indexOf(' ') !== -1) {
            res.json('103');
            return;
        }
        function checkEmail() {
            db.collection('users').findOne({email: email}, (err, user) => {
                if (err) {
                    console.log(err);
                    res.json('106');
                } else if (user) {
                    res.json('104');
                } else {
                    checkUsername();
                }
            });
        }
        function checkUsername() {
            db.collection('users').findOne({username: username}, (err, user) => {
                if (err) {
                    console.log(err);
                    res.json('106');
                } else if (user) {
                    res.json('105');
                } else {
                    newUser();
                }
            });
        }
        function newUser() {
            bcrypt.hash(password, 8, (err, hash) => {
                if (err) {
                    console.log(err);
                    res.json('106');
                } else {
                    db.collection('users').insertOne({
                        email: email,
                        username: username,
                        password: hash
                    }, (err, doc) => {
                        if (err) {
                            console.log(err);
                            res.json('106');
                        } else {
                            res.json('100');
                        }
                    })
                }
            });
        }

        checkEmail();

    });

    app.post('/login', (req, res) => {
        let email = req.body.email;
        let password = req.body.password;

    });

    app.post('signup', (req, res, next) => {
        let hash = bcrypt.hashSync(req.body.password, 8);
        db.collection('users').findOne({ username: req.body.username }, function (err, user) {
            if(err) {
                next(err);
            } else if (user) {
                res.redirect('/');
            } else {
                db.collection('users').insertOne({
                    username: req.body.username,
                    password: hash
                }, (err, doc) => {
                    if(err) {
                        res.redirect('/');
                    } else {
                        next(null, user)
                    }
                })
            }
        })
    }, passport.authenticate('local', { failureRedirect: '/' }), (req, res, next) => {
        res.redirect('/');
    });

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname+'/client/build/index.html'));
    });
};