const express = require('express');
const mongo = require('mongodb').MongoClient;
const path = require('path');
const helmet = require('helmet');
const session = require('express-session');
const routes = require('./routes.js');
const auth = require('./auth.js');

const app = express();


const uristring = process.env.MONGODB_URI || 'mongodb://test:abcd1234@ds125684.mlab.com:25684/freecodecamp';

// if( process.env.PORT ) {
//     app.use((req, res, next) => {
//         if (req.header('X-Forwarded-Proto') === 'https') {
//         next();
//     } else res.redirect('https://' + req.hostname + req.url);
// });
// }

app.use(helmet());
app.use(express.static(path.join(__dirname, 'client/build')));

mongo.connect(uristring, { useNewUrlParser: true }, (err, client) => {
    let dbName = process.env.DBNAME || 'freecodecamp';
    let db = client.db(dbName);

    if(err) {
        console.log('Database error: ' + err);
    } else {
        console.log('Successful database connection');

        auth(app, db);

        routes(app, db);

        const port = process.env.PORT || 5000;
        app.listen(port);
    }
});



