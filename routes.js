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
    // 150 vote success, 151 vote failed, 152 save success, 153 save failed, 154 hide success, 155 hide failed
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

    app.post('/createcomment', (req, res, next) => {
        req.isAuthenticated() ? next() : res.json('111')
    }, (req, res) => {
        if (req.body.comment === '' || req.body.comment === 'What are your thoughts?') {
            res.json('131');
            return
        }
        const date = new Date();
    });

    app.post('/getNewPost', (req, res, next) => {
        req.isAuthenticated();
        next();
        }, (req, res) => {
            const userId = req.user ? req.user._id.toString() : null;
            let data;
            let oldestPost = req.body.oldestPost;
            let date = new Date(oldestPost);

            (async function() {
                try {
                    let data = oldestPost === null ?
                        await db.collection('posts').find({}).sort({date: -1}).limit(5).toArray() :
                        await db.collection('posts').find({date: {$lt: date}}).sort({date: -1}).limit(5).toArray();
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
                    // add isSaved if logged in
                    data.map((i) => i.isSaved = false);
                    if (userId !== null && req.user.savedPosts) {
                        data.map((i) => req.user.savedPosts.indexOf(i._id.toString()) === -1 ? null : i.isSaved = true);
                    }
                    // hide hidden posts if logged in
                    let dataExcludesHiddenPosts = [];
                    if (userId !== null && req.user.hiddenPosts) {
                        data.map((i) => req.user.hiddenPosts.indexOf(i._id.toString()) === -1 ? dataExcludesHiddenPosts.push(i) : null);
                        //if all the new post got is hidden
                        while (dataExcludesHiddenPosts.length === 0 && data.length !== 0) {
                            oldestPost = data[data.length - 1].date;
                            date = new Date(oldestPost);
                            data = await db.collection('posts').find({date: {$lt: date}}).sort({date: -1}).limit(5).toArray();
                            data.map((i) => req.user.hiddenPosts.indexOf(i._id.toString()) === -1 ? dataExcludesHiddenPosts.push(i) : null);
                        }
                    } else {
                        dataExcludesHiddenPosts = [...data]
                    }

                    // add isEditable if post author is this user
                    dataExcludesHiddenPosts.map((i) => i.isEditable = false);
                    if (userId !== null) {
                        const author = req.user.username;
                        dataExcludesHiddenPosts.map((i) => {
                            if (i.username === author) i.isEditable = true
                        });
                    }


                    dataExcludesHiddenPosts.length === 0 ?
                        res.json('140') :
                        res.json(dataExcludesHiddenPosts);
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

    app.post('/savepost', (req, res, next) => {
        req.isAuthenticated() ? next() : res.json('111')
    }, (req, res) => {
        const postId = req.body.id.toString();
        const userId = req.user._id;
        const isCancel = req.body.isCancel;
        (async function() {
            try {
                let savedPosts = req.user.savedPosts ? req.user.savedPosts.slice() : [];
                const index =  savedPosts.indexOf(postId);
                if (isCancel) {
                    // cancel existing save
                    if (index !== -1) savedPosts.splice(index, 1)
                } else {
                    // add new save post
                    if (index === -1) savedPosts.push(postId);
                }
                await db.collection('users').updateOne({_id: userId}, {$set: {savedPosts : savedPosts}});
                res.json('152');
            } catch (err) {
                console.log(err);
                res.json('153');
            }
        })();
    });

    app.post('/hidepost', (req, res, next) => {
        req.isAuthenticated() ? next() : res.json('111')
    }, (req, res) => {
        const postId = req.body.id.toString();
        const userId = req.user._id;
        (async function() {
            try {
                let hiddenPosts = req.user.hiddenPosts ? req.user.hiddenPosts.slice() : [];
                const index =  hiddenPosts.indexOf(postId);
                if (index === -1) hiddenPosts.push(postId);
                await db.collection('users').updateOne({_id: userId}, {$set: {hiddenPosts : hiddenPosts}});
                res.json('154');
            } catch (err) {
                console.log(err);
                res.json('155');
            }
        })();
    });

    app.post('/getComment', (req, res, next) => {
        req.isAuthenticated();
        next();
    }, (req, res) => {
        let postId = req.body.postId;
        const userId = req.user ? req.user._id : null;
        (async function() {
            try {
                const post = await db.collection('posts').findOne({_id: ObjectId(postId)});
                post.isUpVoted = false;
                post.isDownVoted = false;
                post.isSaved = false;
                post.isEditable = false;
                post.isHidden = false;

                if (userId !== null) {
                    if (req.user.username === post.username) post.isEditable = true;
                    const user = await db.collection('users').findOne({_id: userId});
                    if (user.savedPosts) {
                        if (user.savedPosts.indexOf(postId.toString()) !== -1) post.isSaved = true;
                    }
                    if (post.upVotes) {
                        if (post.upVotes.indexOf(userId.toString()) !== -1) post.isUpVoted = true;
                    }
                    if (post.downVotes) {
                        if (post.downVotes.indexOf(userId.toString()) !== -1) post.isDownVoted = true;
                    }
                    if (user.hiddenPosts) {
                        if (user.hiddenPosts.indexOf(postId.toString()) !== -1) post.isHidden = true;
                    }
                }
                res.json(post);
            } catch (err) {
                console.log(err);
            }
        })();
    });

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname+'/client/build/index.html'));
    });
};