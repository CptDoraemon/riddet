const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require ("mongoose");
const helmet = require('helmet');
const session = require('express-session');
const passport = require('passport');
const app = express();


const uristring = process.env.MONGODB_URI;
//|| 'mongodb://test:abcd1234@ds125684.mlab.com:25684/freecodecamp';
let feedbackSchema = new mongoose.Schema({
    name: String,
    email: String,
    message: String,
    date: Date
});
let Feedback = mongoose.model('Feedback', feedbackSchema);

// if( process.env.PORT ) {
//     app.use((req, res, next) => {
//         if (req.header('X-Forwarded-Proto') === 'https') {
//         next();
//     } else res.redirect('https://' + req.hostname + req.url);
// });
// }

app.use(helmet());
app.use(express.static(path.join(__dirname, 'client/build')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// app.use(session({
//     secret: process.env.SESSION_SECRET,
//     resave: true,
//     saveUninitialized: true,
// }));
// app.use(passport.initialize());
// app.use(passport.session());







app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname+'/client/build/index.html'));
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname+'/client/build/index.html'));
});


const port = process.env.PORT || 5000;
app.listen(port);
