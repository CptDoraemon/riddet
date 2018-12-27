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

    // 100 email check success; 101 invalid email; 102 invalid username; 103 invalid password
    // 104 email taken; 105 username taken; 106 database error
    // 110 login success; 111 login failed
    app.post('/signup/first', (req, res) => {
        let email = req.body.email;
        if (email.indexOf('@') === -1) {
            res.json('101');
        } else {
            db.collection('users').findOne( {email: email}, (err, user) => {
                if (err) {
                    res.json('106');
                    console.log(err);
                } else if (user) {
                    res.json('104');
                } else {
                    res.json('100');
                }
            })
        }
    });
    app.post('/signup/second', (req, res, next) => {
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
                    }, (err, user) => {
                        if (err) {
                            console.log(err);
                            res.json('106');
                        } else {
                            next(null, user);
                        }
                    })
                }
            });
        }

        checkEmail();

    },
        passport.authenticate('local', { failureRedirect: '/loginFailed',
                                        successRedirect: '/loginSuccess' })
    );

    app.get('/loginSuccess', (req, res) => {
        res.json('110')
    });
    app.get('/loginFailed', (req, res) => {
        res.json('111')
    });

    app.post('/login',
        passport.authenticate('local', { failureRedirect: '/loginFailed', successRedirect: '/loginSuccess' })

    );

    app.get('/verifyAuthentication', (req, res) => {
        req.isAuthenticated() ? res.json('110') : res.json('111');
    });

    app.get('/logout', (req, res) => {
        req.logout();
        res.redirect('/');
    });


    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname+'/client/build/index.html'));
    });
};