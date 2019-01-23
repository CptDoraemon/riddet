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
        // let data;
        // let lastPostId = req.body.lastPostId;
        //
        // (async function() {
        //     try {
        //         if (req.user) {
        //             let hiddenPosts = req.user.hiddenPosts ? [...req.user.hiddenPosts]: [];
        //             hiddenPosts = hiddenPosts.map(i => ObjectId(i));
        //
        //             data = await db.collection('posts').aggregate([
        //                 { $match: { _id: { $nin: hiddenPosts } } },
        //                 { $sort: { date: -1 } },
        //                 { $match: { _id: { $lt: ObjectId(lastPostId) } } },
        //                 { $limit: 5 },
        //             ]).toArray();
        //             data = addUserSpecificData(data, req.user);
        //         } else {
        //             data = await db.collection('posts').aggregate([
        //                 { $sort: { date: -1 } },
        //                 { $match: { _id: { $lt: ObjectId(lastPostId) } } },
        //                 { $limit: 5 },
        //             ]).toArray();
        //         }
        //         data.length === 0 ?
        //             //no more posts
        //             res.json('140') :
        //             res.json(data);
        //     } catch (err) {
        //         console.log(err);
        //         res.json('106');
        //     }
        // })();
    }
    );

    app.post('/getHotPost', (req, res, next) => {
            req.isAuthenticated();
            next();
        }, (req, res) => {

        }
    );

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
