const passport = require('passport');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const path = require('path');
const ObjectId = require('mongodb').ObjectID;

const requestPosts = require('./APIs/requestPosts');

module.exports = function (app, db) {

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));


    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname  + '/../client/build/index.html'));
    });


    requestPosts(app, db);

    // 100 email check success; 101 invalid email; 102 invalid username; 103 invalid password;
    // 104 email taken; 105 username taken; 106 database error
    // 110 login success; 111 login failed; 112 qualified to edit; 113 not qualified to edit
    // 120 logout success
    // 130 create post/reply success, 131 post/reply invalid, 133 reply/post failed
    // 140 no more new posts
    // 150 vote success, 151 vote failed, 152 save success, 153 save failed, 154 hide success, 155 hide failed
    // 160 report success, 161 report reason too long
    // 198 success, 199 failed
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

    app.post('/updatePassword', (req, res, next) => {
        req.isAuthenticated() ? next() : res.json('111')
    }, (req, res) => {
        const currentPassword = req.body.currentPassword;
        const newPassword = req.body.newPassword;
        const confirmNewPassword = req.body.confirmNewPassword;
        console.log(currentPassword, newPassword, confirmNewPassword);

        const currentPasswordIsValid = currentPassword.length >= 8 && currentPassword.indexOf(' ') === -1;
        const newPasswordIsValid = newPassword.length >= 8 && newPassword.indexOf(' ') === -1 && newPassword === confirmNewPassword && newPassword !== currentPassword;
        if (!currentPasswordIsValid || !newPasswordIsValid) {
            res.json('103');
            return
        }

        (async function() {
            try {
                const hash = await bcrypt.hash(newPassword, 8);
                const user = await db.collection('users').findOne({_id: req.user._id});
                const realCurrentPassword = user.password;
                const authentication = await bcrypt.compare(currentPassword, realCurrentPassword);
                if (!authentication) {
                    res.json('103')
                } else {
                    await db.collection('users').updateOne({_id: req.user._id}, {$set: {password: hash}});
                    res.json('198')
                }
            } catch (err) {
                console.log(err);
                res.json('106')
            }
        })();
    });

    app.post('/login',
        passport.authenticate('local', { failureRedirect: '/loginFailed', successRedirect: '/loginSuccess' })
    );

    app.post('/verifyAuthentication', (req, res) => {
        req.isAuthenticated() ? res.json({code: '110', username: req.user.username, userId: req.user._id.toString()}) : res.json({code: '111'});
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

    app.post('/updatePostOrComment', (req, res, next) => {
        req.isAuthenticated() ? next() : res.json('111')
    }, (req, res) => {
        (async function() {
            try {
                const id = ObjectId(req.body.id);
                const type = req.body.type;
                const title = req.body.title;
                const post = req.body.post;
                const collection = type + 's';

                // data validation
                if (type === 'post') {
                    if (req.body.title === '' || req.body.title === 'Title (required)') {
                        res.json('131');
                        return
                    }
                } else if (type === 'comment') {
                    if (req.body.post === '' || req.body.post === 'What are your thoughts?') {
                        res.json('131');
                        return
                    }
                }

                // check qualification
                const doc = await db.collection(collection).findOne({_id: id});
                const author = doc.username;
                if (author !== req.user.username) {
                    res.json('113');
                    return
                }

                // update
                if (type === 'post') {
                    await db.collection(collection).updateOne({_id: id},
                        {$set: {title: title, post: post, isEdited: true}})
                } else if (type === 'comment') {
                    await db.collection(collection).updateOne({_id: id},
                        {$set: {comment: post, isEdited: true}})
                }

                res.json('130')
            } catch (err) {
                console.log(err);
                res.json('106');
            }
        })();
    });

    app.post('/replyToPost', (req, res, next) => {
        req.isAuthenticated() ? next() : res.json('111')
    }, (req, res) => {
        if (req.body.comment === '' || req.body.comment === 'What are your thoughts?') {
            res.json('131');
            return
        }
        const date = new Date();
        (async function() {
            try {
                const reply = await db.collection('comments').insertOne({
                    username: req.user.username,
                    comment: req.body.comment,
                    parentPost: req.body.parentPostId,
                    date: date,
                });
                await  db.collection('posts').updateOne(
                    { _id: ObjectId(req.body.parentPostId) },
                    { $push: {comments: reply.insertedId.toString()}}
                    );
                res.json('130');
            } catch(err) {
                console.log(err);
                res.json('106');
            }
        })();
    });

    app.post('/replyToComment', (req, res, next) => {
        req.isAuthenticated() ? next() : res.json('111')
    }, (req, res) => {
        if (req.body.comment === '' || req.body.comment === 'What are your thoughts?') {
            res.json('131');
            return
        }
        // RECEIVED:
        // const data = {
        //     parentPostId: this.props.postId,
        //     parentCommentId: this.props.parentCommentId,
        //     comment: this.state.tePost
        // };
        const date = new Date();
        (async function() {
            try {
                const reply = await db.collection('comments').insertOne({
                    username: req.user.username,
                    comment: req.body.comment,
                    parentPost: req.body.parentPostId.toString(),
                    parentCommentId: req.body.parentCommentId.toString(),
                    date: date,
                });
                let post = await db.collection('posts').findOne({  _id: ObjectId(req.body.parentPostId) });
                let comments = post.comments;
                const parentCommentId = req.body.parentCommentId.toString();
                const commentId = reply.insertedId.toString();

                function loop(array) {
                    for (let i=0; i< array.length; i++) {
                        if(array[i] instanceof Array) {
                            if(array[i][0] === parentCommentId){
                                array[i].push(commentId);
                            } else {
                                loop(array[i])
                            }
                        } else {
                            if (array[i] ===  parentCommentId) {
                                let newArray = [];
                                newArray.push(array[i]);
                                newArray.push(commentId);
                                array[i] = newArray;
                            }
                        }
                    }
                }
                loop(comments);
                await db.collection('posts').updateOne({_id: post._id}, {$set: {comments: comments}});
                res.json('130');
            } catch(err) {
                console.log(err);
                res.json('106');
            }
        })();
    });

    app.post('/upVote', (req, res, next) => {
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

    app.post('/upVoteComment', (req, res, next) => {
        req.isAuthenticated() ? next() : res.json('111')
    }, (req, res) => {
        const commentId = ObjectId(req.body.id);
        const userId = req.user._id.toString();
        const isCancel = req.body.isCancel;
        (async function() {
            try {
                let comment = await db.collection('comments').findOne({_id: commentId});
                let upVotesArray =  comment.upVotes ? comment.upVotes.slice() : [];
                const index =  upVotesArray.indexOf(userId);
                // cancel existing vote
                if (isCancel) {
                    if (index !== -1) upVotesArray.splice(index, 1);
                } else {
                    // new vote
                    if (index === -1) upVotesArray.push(userId);
                }
                await db.collection('comments').updateOne({_id: commentId}, {$set: {upVotes: upVotesArray}});
                res.json('150');
            } catch (err) {
                console.log(err);
                res.json('151');
            }
        })();
    });

    app.post('/downVote', (req, res, next) => {
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

    app.post('/downVoteComment', (req, res, next) => {
        req.isAuthenticated() ? next() : res.json('111')
    }, (req, res) => {
        const commentId = ObjectId(req.body.id);
        const userId = req.user._id.toString();
        const isCancel = req.body.isCancel;
        (async function() {
            try {
                let downVotes = await db.collection('comments').findOne({_id: commentId});
                let downVotesArray =  downVotes.downVotes ? downVotes.downVotes.slice() : [];
                const index =  downVotesArray.indexOf(userId);
                // cancel existing vote
                if (isCancel) {
                    if (index !== -1) downVotesArray.splice(index, 1);
                } else {
                    // new vote
                    if (index === -1) downVotesArray.push(userId);
                }
                await db.collection('comments').updateOne({_id: commentId}, {$set: {downVotes: downVotesArray}});
                res.json('150');
            } catch (err) {
                console.log(err);
                res.json('151');
            }
        })();
    });

    app.post('/savePost', (req, res, next) => {
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

    app.post('/saveComment', (req, res, next) => {
        req.isAuthenticated() ? next() : res.json('111')
    }, (req, res) => {
        const commentId = req.body.id.toString();
        const userId = req.user._id;
        const isCancel = req.body.isCancel;
        (async function() {
            try {
                let savedComments = req.user.savedComments ? req.user.savedComments.slice() : [];
                const index =  savedComments.indexOf(commentId);
                if (isCancel) {
                    // cancel existing save
                    if (index !== -1) savedComments.splice(index, 1)
                } else {
                    // add new save post
                    if (index === -1) savedComments.push(commentId);
                }
                await db.collection('users').updateOne({_id: userId}, {$set: {savedComments : savedComments}});
                res.json('152');
            } catch (err) {
                console.log(err);
                res.json('153');
            }
        })();
    });

    app.post('/hidePost', (req, res, next) => {
        req.isAuthenticated() ? next() : res.json('111')
    }, (req, res) => {
        const postId = req.body.id.toString();
        const userId = req.user._id;
        const isCancel = req.body.isCancel;
        (async function() {
            try {
                let hiddenPosts = req.user.hiddenPosts ? req.user.hiddenPosts.slice() : [];
                const index =  hiddenPosts.indexOf(postId);
                if (isCancel) {
                    // cancel existing save
                    if (index !== -1) hiddenPosts.splice(index, 1)
                } else {
                    // add new save post
                    if (index === -1) hiddenPosts.push(postId);
                }
                await db.collection('users').updateOne({_id: userId}, {$set: {hiddenPosts : hiddenPosts}});
                res.json('154');
            } catch (err) {
                console.log(err);
                res.json('155');
            }
        })();
    });

    app.post('/hideComment', (req, res, next) => {
        req.isAuthenticated() ? next() : res.json('111')
    }, (req, res) => {
        const commentId = req.body.id.toString();
        const userId = req.user._id;
        const isCancel = req.body.isCancel;
        (async function() {
            try {
                let hiddenComments = req.user.hiddenComments ? req.user.hiddenComments.slice() : [];
                const index =  hiddenComments.indexOf(commentId);
                if (isCancel) {
                    // cancel existing hide
                    if (index !== -1) hiddenComments.splice(index, 1)
                } else {
                    // add new hide post
                    if (index === -1) hiddenComments.push(commentId);
                }
                await db.collection('users').updateOne({_id: userId}, {$set: {hiddenComments : hiddenComments}});
                res.json('154');
            } catch (err) {
                console.log(err);
                res.json('155');
            }
        })();
    });

    // Load the main post only for comment page.
    app.post('/getCommentMainPost', (req, res, next) => {
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
                const user = await db.collection('users').findOne({_id: userId});


                function appendProperties(post, postId) {
                    if (req.user.username === post.username) post.isEditable = true;
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
                // IF LOG IN, ADD PROPERTIES:
                if (userId !== null) {
                    appendProperties(post, postId);
                }
                res.json(post);
            } catch (err) {
                console.log(err);
            }
        })();
    });

    // load comments only for comment page
    app.post('/getComment', (req, res, next) => {
        req.isAuthenticated();
        next();
    }, (req, res) => {
        const userId = req.user ? req.user._id : null;
        let commentRequesting = req.body.commentRequesting;
        commentRequesting = commentRequesting.map((i) => ObjectId(i));
        (async function() {
            try {
                let comments = [];
                // CHANGE THIS LOOP LATER!! USE ONE QUERY
                for (let i=0; i<commentRequesting.length; i++) {
                    let comment = await db.collection('comments').findOne({_id: commentRequesting[i]});
                    comments.push(comment);
                }
                //let comments = await db.collection('comments').find({_id: {$in: commentRequesting}}).toArray();
                const user = await db.collection('users').findOne({_id: userId});
                //
                function appendProperties(comment, commentId, userId) {
                    if (req.user.username === comment.username) comment.isEditable = true;
                    if (user.savedComments) {
                        if (user.savedComments.indexOf(commentId.toString()) !== -1) comment.isSaved = true;
                    }
                    if (comment.upVotes) {
                        if (comment.upVotes.indexOf(userId.toString()) !== -1) comment.isUpVoted = true;
                    }
                    if (comment.downVotes) {
                        if (comment.downVotes.indexOf(userId.toString()) !== -1) comment.isDownVoted = true;
                    }
                    if (user.hiddenComments) {
                        if (user.hiddenComments.indexOf(commentId.toString()) !== -1) comment.isHidden = true;
                    }
                }
                comments.map((comment) => {
                    comment.isEditable = false;
                    comment.isSaved = false;
                    comment.isUpVoted = false;
                    comment.isDownVoted = false;
                    comment.isHidden = false;
                });
                // IF LOG IN, ADD PROPERTIES:
                if (userId !== null) {
                    comments.map((comment) => appendProperties(comment, comment._id, userId))
                }
                res.json(comments);
            } catch (err) {
                console.log(err);
            }
        })();
    });

    app.post('/verifyEditQualification', (req, res, next) => {
        req.isAuthenticated() ? next() : res.json('111')
    }, (req, res) => {
        const type = req.body.type;
        const id = ObjectId(req.body.id);
        const username = req.user.username;
        let collection;
        if (type === 'post') {
            collection = 'posts'
        } else if (type === 'comment') {
            collection = 'comments'
        }
        (async function() {
            try {
                const doc = await db.collection(collection).findOne({_id: id});
                const author = doc.username;
                // success response
                const response = {
                    code: '112',
                    title: type === 'post' ? doc.title : null,
                    content: type === 'post' ? doc.post : doc.comment,
                };
                author === username ? res.json(response) : res.json('113');
            } catch (err) {
                console.log(err);
                res.json('106');
            }
        })();
    });

    app.post('/accountSettingVerification', (req, res, next) => {
        const userId = req.body.userId;
        req.isAuthenticated() && req.user._id.toString() === userId ?
            next() :
            res.json('111')
    }, (req, res) => {
        const user = req.user;
        const username = user.username;
        const signature = user.signature ? user.signature : '';
        const data = {
            username: username,
            signature: signature,
            savedPosts: user.savedPosts ? [...user.savedPosts] : [],
            hiddenPosts: user.hiddenPosts ? [...user.hiddenPosts] : [],
            savedComments: user.savedComments ? [...user.savedComments] : [],
            hiddenComments: user.hiddenComments ? [...user.hiddenComments] : [],
        };
        (async function() {
            function trimLongPost(array) {
                const length = 100;
                array.map((i) => {
                    if (i.title) {
                        if (i.title.length > length) i.title = i.title.slice(0, length) + '...';
                    }
                    if (i.post) {
                        if (i.post.length > length) i.post = i.post.slice(0, length) + '...'
                    }
                });
            }
            function trimLongComment(array) {
                const length = 100;
                array.map((i) => {
                    if (i.comment) {
                        if (i.comment.length > length) i.comment = i.comment.slice(0, length) + '...';
                    }
                })
            }
            try {
                const userPosts = await db.collection('posts').find({username: username}).sort({date: -1}).toArray();
                const userComments = await db.collection('comments').find({username: username}).sort({date: -1}).toArray();
                trimLongPost(userPosts);
                trimLongComment(userComments);

                let savedPosts = [];
                let hiddenPosts = [];
                let savedComments = [];
                let hiddenComments = [];
                if (data.savedPosts.length !== 0) {
                    data.savedPosts.map((idString, index, array) => array[index] = ObjectId(idString));
                    savedPosts = await db.collection('posts').find({_id: {$in: data.savedPosts}}).toArray();
                    trimLongPost(savedPosts);
                }
                if (data.hiddenPosts.length !== 0) {
                    data.hiddenPosts.map((idString, index, array) => array[index] = ObjectId(idString));
                    hiddenPosts = await db.collection('posts').find({_id: {$in: data.hiddenPosts}}).toArray();
                    trimLongPost(hiddenPosts);
                }
                if (data.savedComments.length !== 0) {
                    data.savedComments.map((idString, index, array) => array[index] = ObjectId(idString));
                    savedComments = await db.collection('comments').find({_id: {$in: data.savedComments}}).toArray();
                    trimLongComment(savedComments);
                }
                if (data.hiddenComments.length !== 0) {
                    data.hiddenComments.map((idString, index, array) => array[index] = ObjectId(idString));
                    hiddenComments = await db.collection('comments').find({_id: {$in: data.hiddenComments}}).toArray();
                    trimLongComment(hiddenComments);
                }
                data.savedPosts = savedPosts;
                data.hiddenPosts = hiddenPosts;
                data.savedComments = savedComments;
                data.hiddenComments = hiddenComments;
                data.userPosts = userPosts ? userPosts : [];
                data.userComments = userComments ? userComments : [];

                //console.log(data);
                res.json(data);
            } catch (err) {
                console.log(err);
                res.json('106')
            }
        })();
    });

    app.post('/updateSignature', (req, res, next) => {
        req.isAuthenticated() ? next() : res.json('111')
    }, (req, res) => {
        const signature = req.body.signature;
        if (req.user.signature === signature) res.json('104');
        if (signature.length > 20) res.json('105');

        (async function() {
            try{
                await db.collection('users').updateOne({_id: req.user._id}, {$set: {signature: signature}});
                res.json('104');
            } catch (err) {
                console.log(err);
                res.json('105');
            }
        })();
    });

    app.post('/submitReport', (req, res, next) => {
        req.isAuthenticated() ? next() : res.json('111')
    }, (req, res) => {
        const data = req.body.data;
        const type = data.type;
        const id = data.id.toString();
        const reason = data.reason;
        const isHide = data.isHide;
        const userId = req.user._id;

        if (reason.length > 200) {
            res.json('161');
            return
        }

        (async function() {
            try {
               await db.collection('reports').insertOne({type: type, id: id, reason: reason, reportedByUserId: userId.toString()});
               if (isHide) {
                   if (type === 'post') {
                       let hiddenPosts = req.user.hiddenPosts ? req.user.hiddenPosts.slice() : [];
                       const index =  hiddenPosts.indexOf(id);
                       if (index === -1) hiddenPosts.push(id);
                       await db.collection('users').updateOne({_id: userId}, {$set: {hiddenPosts : hiddenPosts}});
                   } else if (type === 'comment') {
                       let hiddenComments = req.user.hiddenComments ? req.user.hiddenComments.slice() : [];
                       const index =  hiddenComments.indexOf(id);
                       if (index === -1) hiddenComments.push(id);
                       await db.collection('users').updateOne({_id: userId}, {$set: {hiddenComments : hiddenComments}});
                   }
               }
               res.json('160');
            } catch (err) {
                console.log(err);
                res.json('155');
            }
        })();
    });

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname  + '/../client/build/index.html'));
    });
};