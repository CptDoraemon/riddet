const passport = require('passport');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const path = require('path');
const ObjectId = require('mongodb').ObjectID;

module.exports = function (app, db) {

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));


    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname+'/client/build/index.html'));
    });

    // 100 email check success; 101 invalid email; 102 invalid username; 103 invalid password
    // 104 email taken; 105 username taken; 106 database error
    // 110 login success; 111 login failed
    // 120 logout success
    // 130 create post success, 131 post invalid
    // 140 no more new posts
    // 150 vote success, 151 vote failed
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

    app.get('/loginSuccess', (req, res, next) => {
        res.json({code: '110', username: req.user.username})
    });
    app.get('/loginFailed', (req, res) => {
        res.json({code: '111'})
    });

    app.post('/login',
        passport.authenticate('local', { failureRedirect: '/loginFailed', successRedirect: '/loginSuccess' })
    );

    app.get('/verifyAuthentication', (req, res) => {
        req.isAuthenticated() ? res.json({code: '110', username: req.user.username}) : res.json({code: '111'});
    });

    app.get('/logout', (req, res) => {
        req.logout();
        res.json('120');
    });

    app.get('/createpost', (req, res, next) => {
        req.isAuthenticated() ? next() : res.redirect('/');
    });

    app.post('/createpost', (req, res, next) => {
        req.isAuthenticated() ? next() : res.json('111')
    }, (req, res) => {
        if (req.body.title === '' || req.body.title === 'Title (required)') {
            res.json('131');
            return
        }
        const date = new Date();
        db.collection('posts').insertOne({
            username: req.body.username,
            title: req.body.title,
            post: req.body.post,
            date: date
        }, (err, post) => {
            if (err) {
                console.log(err);
                res.json('106');
            } else {
                res.json('130');
            }
        })
    });
    app.post('/getNewPost', (req, res, next) => {
        req.isAuthenticated();
        next();
        }, (req, res) => {
            const userId = req.user ? req.user._id.toString() : null;
            let data;
            let oldestPost = req.body.oldestPost;
            const date = new Date(oldestPost);

            (async function() {
                try {
                    const data = oldestPost === null ?
                        await db.collection('posts').find({}).sort({date: -1}).limit(5).toArray() :
                        await db.collection('posts').find({date: {$lt: date}}).sort({date: -1}).limit(5).toArray() ;
                    // add isUpVoted / isDownVoted if logged in
                    data.map((i) => {
                        i.isUpVoted = false;
                        i.isDownVoted = false;
                    });
                    if (userId !== null) {
                        data.map((i) => {
                            if (i.upVotes) {
                                if (i.upVotes.indexOf(userId) !== -1) i.isUpVoted = true;
                            }
                            if (i.downVotes) {
                                if (i.downVotes.indexOf(userId) !== -1) i.isDownVoted = true;
                            }
                        });
                    }
                    res.json(data);
                } catch (err) {
                    console.log(err);
                    res.json('106');
                }
            })();
        }
    );

    app.post('/upvote', (req, res, next) => {
        req.isAuthenticated() ? next() : res.json('111')
    }, (req, res) => {
        const postId = ObjectId(req.body.id);
        const userId = req.user._id.toString();
        const isCancel = req.body.isCancel;
        (async function() {
            try {
                let upVotes = await db.collection('posts').findOne({_id: postId});
                let upVotesArray =  upVotes.upVotes ? upVotes.upVotes.slice() : [];
                const index =  upVotesArray.indexOf(userId);
                // cancel existing vote
                if (isCancel) {
                    if (index !== -1) upVotesArray.splice(index, 1);
                } else {
                    // new vote
                    if (index === -1) upVotesArray.push(userId);
                }
                await db.collection('posts').updateOne({_id: postId}, {$set: {upVotes: upVotesArray}});
                res.json('150');
            } catch (err) {
                console.log(err);
                res.json('151');
            }
        })();
    });

    app.post('/downvote', (req, res, next) => {
        req.isAuthenticated() ? next() : res.json('111')
    }, (req, res) => {
        const postId = ObjectId(req.body.id);
        const userId = req.user._id.toString();
        const isCancel = req.body.isCancel;
        (async function() {
            try {
                let downVotes = await db.collection('posts').findOne({_id: postId});
                let downVotesArray =  downVotes.downVotes ? downVotes.downVotes.slice() : [];
                const index =  downVotesArray.indexOf(userId);
                // cancel existing vote
                if (isCancel) {
                    if (index !== -1) downVotesArray.splice(index, 1);
                } else {
                    // new vote
                    if (index === -1) downVotesArray.push(userId);
                }
                await db.collection('posts').updateOne({_id: postId}, {$set: {downVotes: downVotesArray}});
                res.json('150');
            } catch (err) {
                console.log(err);
                res.json('151');
            }
        })();
    });

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname+'/client/build/index.html'));
    });
};