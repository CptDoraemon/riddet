const ObjectId = require('mongodb').ObjectID;

module.exports = function (app, db) {

    app.post('/getNewPost', (req, res, next) => {
            req.isAuthenticated();
            next();
        }, (req, res) => {
            let data;
            let lastPostId = req.body.lastPostId;

            (async function() {
                try {
                    if (req.user) {
                        let hiddenPosts = req.user.hiddenPosts ? [...req.user.hiddenPosts]: [];
                        hiddenPosts = hiddenPosts.map(i => ObjectId(i));

                        data = await db.collection('posts').aggregate([
                            { $match: { _id: { $nin: hiddenPosts } } },
                            { $sort: { date: -1 } },
                            { $match: { _id: { $lt: ObjectId(lastPostId) } } },
                            { $limit: 5 },
                        ]).toArray();
                        data = addUserSpecificData(data, req.user);
                    } else {
                        data = await db.collection('posts').aggregate([
                            { $sort: { date: -1 } },
                            { $match: { _id: { $lt: ObjectId(lastPostId) } } },
                            { $limit: 5 },
                        ]).toArray();
                    }
                    data.length === 0 ?
                        //no more posts
                        res.json('140') :
                        res.json(data);
                } catch (err) {
                    console.log(err);
                    res.json('106');
                }
            })();
        }
    );

    app.post('/getTopPost', (req, res, next) => {
            req.isAuthenticated();
            next();
        }, (req, res) => {
            let data;
            let lastPostId = req.body.lastPostId;

            (async function() {
                try {
                    let hiddenPosts = [];
                    if (req.user) {
                        if (req.user.hiddenPosts) hiddenPosts = [...req.user.hiddenPosts];
                        hiddenPosts = hiddenPosts.map(i => ObjectId(i));
                    }
                    // add size of nested comments array
                    await db.collection('posts').find().forEach((doc) => {
                        if (doc.comments && doc.comments.length) {
                            let count = 0;
                            const loop = (array) => {
                                for (let i=0; i<array.length; i++) {
                                    array[i] instanceof Array ? loop(array[i]) : count++
                                }
                            };
                            loop(doc.comments);
                            db.collection('posts').updateOne({ _id: doc._id}, { $set: { commentsCount: count } });
                        } else {
                            db.collection('posts').updateOne({ _id: doc._id}, { $set: { commentsCount: 0 } });
                        }
                    });
                    // SORT BY COMMENT THEN DATE
                    let requestedPostId = [];
                    let count = 0;
                    let foundTarget = false;
                    await db.collection('posts').aggregate([
                        { $match: { _id: { $nin: hiddenPosts } } },
                        { $project: { _id: 1, commentsCount: 1, date: 1}},
                        { $sort: { commentsCount: -1, date: -1 } },
                    ]).forEach((doc) => {
                        let postId = doc._id.toString();
                        // first request:
                        if (lastPostId === null) {
                           count++
                        } else {
                            // sequential request
                            if (foundTarget) count++;
                            if (postId === lastPostId) foundTarget = true;
                        }
                        if (1 <= count && count <= 5) {
                            requestedPostId.push(postId)
                        }
                    });
                    //
                    data = [];
                    for(let i=0; i<requestedPostId.length; i++) {
                        let doc = await db.collection('posts').findOne({ _id: ObjectId(requestedPostId[i]) });
                        data.push(doc);
                    }

                    // if logged in, add user specific data
                    if (req.user) {
                        data = addUserSpecificData(data, req.user);
                    }

                    data.length === 0 ?
                        //no more posts
                        res.json('140') :
                        res.json(data);
                } catch (err) {
                    console.log(err);
                    res.json('106');
                }
            })();
        }
    );

    app.post('/getHotPost', (req, res, next) => {
            req.isAuthenticated();
            next();
        }, (req, res) => {
        let data;
        let lastPostId = req.body.lastPostId;

        (async function() {
            try {
                let hiddenPosts = [];
                if (req.user) {
                    if (req.user.hiddenPosts) hiddenPosts = [...req.user.hiddenPosts];
                    hiddenPosts = hiddenPosts.map(i => ObjectId(i));
                }
                // add size of nested comments array
                await db.collection('posts').find().forEach((doc) => {
                    if (doc.comments && doc.comments.length) {
                        let commentsFlat = [];
                        const loop = (array) => {
                            for (let i=0; i<array.length; i++) {
                                array[i] instanceof Array ? loop(array[i]) : commentsFlat.push(ObjectId(array[i]))
                            }
                        };
                        loop(doc.comments);
                        db.collection('posts').updateOne({ _id: doc._id}, { $set: { commentsFlat: commentsFlat } });
                    } else {
                        db.collection('posts').updateOne({ _id: doc._id}, { $set: { commentsFlat: 0 } });
                    }
                });
                // SORT BY LAST COMMENT DATE THEN POST DATE
                let requestedPostId = [];
                let count = 0;
                let foundTarget = false;
                await db.collection('posts').aggregate([
                    { $match: { _id: { $nin: hiddenPosts } } },
                    { $project: { _id: 1, date: 1, 'latestCommentDate': { $max: '$commentsFlat' } } },
                    { $sort: { latestCommentDate: -1, date: -1 } },
                ]).forEach((doc) => {
                    let postId = doc._id.toString();
                    // first request:
                    if (lastPostId === null) {
                        count++
                    } else {
                        // sequential request
                        if (foundTarget) count++;
                        if (postId === lastPostId) foundTarget = true;
                    }
                    if (1 <= count && count <= 5) {
                        requestedPostId.push(postId)
                    }
                });
                //
                data = [];
                for(let i=0; i<requestedPostId.length; i++) {
                    let doc = await db.collection('posts').findOne({ _id: ObjectId(requestedPostId[i]) });
                    data.push(doc);
                }

                // if logged in, add user specific data
                if (req.user) {
                    data = addUserSpecificData(data, req.user);
                }

                data.length === 0 ?
                    //no more posts
                    res.json('140') :
                    res.json(data);
            } catch (err) {
                console.log(err);
                res.json('106');
            }
        })();
    }

    );

    app.post('/search', (req, res, next) => {
        req.isAuthenticated();
        next()
    }, (req, res) => {
        const query = req.body.key;
        (async function() {
            try {
                await db.collection('posts').createIndex({ post: 'text', title: 'text' });
                let data = await db.collection('posts').find(
                    { $text: { $search: query, $caseSensitive: false } }
                )
                    .project({ score: { $meta: "textScore" } })
                    .sort({ score: { $meta: "textScore" } } ).toArray();

                if (req.user) {
                    data = addUserSpecificData(data, req.user);
                }

                res.json(data);
            } catch(err) {
                console.log(err)
            }
        })();
    });

    function addUserSpecificData(postArray, userObj) {
        // if logged in
        // add isUpVoted isDownVoted, isSaved, isEditable
        // TODO add user's signature

        let data = [...postArray];
        const userId = userObj._id.toString();

        data = data.map(post => {
            const postId = post._id.toString();
            // isUpVoted
            let upVotes = post.upVotes ? [...post.upVotes] : [];
            if (upVotes.indexOf(userId) !== -1) post.isUpVoted = true;
            // isDownVoted
            let downVotes = post.downVotes ? [...post.downVotes] : [];
            if (downVotes.indexOf(userId) !== -1) post.isDownVoted = true;
            // isSaved
            let savedPosts = userObj.savedPosts ? [...userObj.savedPosts] : [];
            if (savedPosts.indexOf(postId) !== -1) post.isSaved = true;
            // isEditable
            if (post.username === userObj.username) post.isEditable = true;
            return post;
        });
        return data;
    }
    // const addUserSpecificDataToPost = (postArray, userId) => {
    //     let data = [...postArray];
    //     let dataExcludesHiddenPosts = [];
    //     (async function() {
    //         try {
    //             // add user's signature
    //
    //             // add isUpVoted / isDownVoted if logged in
    //             data.map((i) => {
    //                 i.isUpVoted = false;
    //                 i.isDownVoted = false;
    //             });
    //             if (userId !== null) {
    //                 data.map((i) => {
    //                     if (i.upVotes) {
    //                         if (i.upVotes.indexOf(userId) !== -1) i.isUpVoted = true;
    //                     }
    //                     if (i.downVotes) {
    //                         if (i.downVotes.indexOf(userId) !== -1) i.isDownVoted = true;
    //                     }
    //                 });
    //             }
    //             // add isSaved if logged in
    //             data.map((i) => i.isSaved = false);
    //             if (userId !== null && req.user.savedPosts) {
    //                 data.map((i) => req.user.savedPosts.indexOf(i._id.toString()) === -1 ? null : i.isSaved = true);
    //             }
    //             // hide hidden posts if logged in
    //             if (userId !== null && req.user.hiddenPosts) {
    //                 data.map((i) => req.user.hiddenPosts.indexOf(i._id.toString()) === -1 ? dataExcludesHiddenPosts.push(i) : null);
    //                 //if all the new post got is hidden
    //                 while (dataExcludesHiddenPosts.length === 0 && data.length !== 0) {
    //                     let oldestPost = data[data.length - 1].date;
    //                     let date = new Date(oldestPost);
    //                     data = await db.collection('posts').find({date: {$lt: date}}).sort({date: -1}).limit(5).toArray();
    //                     data.map((i) => req.user.hiddenPosts.indexOf(i._id.toString()) === -1 ? dataExcludesHiddenPosts.push(i) : null);
    //                 }
    //             } else {
    //                 dataExcludesHiddenPosts = [...data]
    //             }
    //
    //             // add isEditable if post author is this user
    //             dataExcludesHiddenPosts.map((i) => i.isEditable = false);
    //             if (userId !== null) {
    //                 const author = req.user.username;
    //                 dataExcludesHiddenPosts.map((i) => {
    //                     if (i.username === author) i.isEditable = true
    //                 });
    //             }
    //         } catch (err) {
    //             throw err
    //         }
    //     })();
    //     return dataExcludesHiddenPosts;
    // };
};
