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

    app.post('/signup/first', (req, res, next) => {
        db.collection('users').findOne( {email: req.body.email}, (err, user) => {
            if (err) {
                console.log(err);
            } else if (user) {
                res.json('1');
            } else {
                res.status(200).json('2');
            }
        })
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