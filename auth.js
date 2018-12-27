const session = require('express-session');
const passport = require('passport');
const ObjectId = require('mongodb').ObjectID;
const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt');

module.exports = function (app, db) {
    app.use(session({
        secret: process.env.SESSION_SECRET || 'hahaha',
        resave: true,
        saveUninitialized: true,
    }));
    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser((user, done) => {
        done(null, user._id);
    });
    passport.deserializeUser((id, done) => {
        db.collection('users').findOne(
            {_id: new ObjectId(id)},
            (err, doc) => {
                done(null, doc);
            }
        )
    });

    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    },
        function(username, password, done) {
            db.collection('users').findOne({ email: username }, function (err, user) {
                console.log('User ' + username + 'attempted to log in.');
                if (err) { return done(err); }
                if (!user) {return done(null, false); }
                bcrypt.compare(password, user.password, (err, res) => {
                    if (!res) {
                        return done(null, false);
                    } else {
                        return done(null, user);
                    }
                });
            });
        }
    ));

};