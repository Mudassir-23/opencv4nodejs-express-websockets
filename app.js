const express = require('express');
const http = require('http');
const path = require('path');
const cookieParser = require('cookie-parser');
const streamEnabler = require('./stream');

const port = process.env.PORT || 3000

const indexRouter = require('./routes/index');

const app = express();
const server = http.Server(app);
const stream = streamEnabler(server);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

server.listen(port, () => {
    console.log('Listening on', port);
});