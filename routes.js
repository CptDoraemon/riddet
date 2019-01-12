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
    // 110 login success; 111 login failed; 112 qualified to edit; 113 not qualified to edit
    // 120 logout success
    // 130 create post/reply success, 131 post/reply invalid, 133 reply/post failed
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

    app.post('/hideComment', (req, res, next) => {
        req.isAuthenticated() ? next() : res.json('111')
    }, (req, res) => {
        const commentId = req.body.id.toString();
        const userId = req.user._id;
        (async function() {
            try {
                let hiddenComments = req.user.hiddenComments ? req.user.hiddenComments.slice() : [];
                const index =  hiddenComments.indexOf(commentId);
                if (index === -1) hiddenComments.push(commentId);
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

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname+'/client/build/index.html'));
    });
};