const express = require('express');
const app = express();
const http = require('http');
const { send } = require('process');
const server = http.createServer(app);
const io = require('socket.io')(server);
const { uniqueNamesGenerator, adjectives, colors, animals } = require('unique-names-generator');
const PORT = process.env.PORT || 3000;

// STATE

  let users = {};

// IO

app.get('/', (req, res) => {
    res.sendFile('index.html', { root: __dirname });
});

app.use(express.static(__dirname + '/public'));

io.on('connection', socket => {
    console.log('A user connected ' + socket.id);

    users[socket.id] = {
        name: uniqueNamesGenerator(nameConfig),
        score: 0,
    };
    sendLeaderboard();

    socket.emit('init', {
       low: low,
       high: high,
       name: users[socket.id].name,
    });

    socket.on('guess', (data) => {
        console.log(data);
        if (data == num) {
            console.log('correct');
            io.emit('correct', { user: users[socket.id].name, num: num });
            users[socket.id].score++;
            sendLeaderboard();
            refreshNum();
        }
        else {
            io.emit('guess', {
                user: users[socket.id].name,
                guess: data, judgement: (data < num) ? 'too low' : 'too high'
            });
        }
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
        delete users[socket.id];
        // io.emit('count', Object.keys(users).length);
        sendLeaderboard();
    });
});

server.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
});

// LOGIC

let num;
let low;
let high;

function refreshNum() {
    let radius = randBetween(100, 500);
    let mid = randBetween(radius, 1000-radius);
    low = mid - radius;
    high = mid + radius;

    num = randBetween(low, high);
    console.log(`Range: [${low}, ${high}], Number: ${num}`);
    io.emit('range', { low: low, high: high });
}

function sendLeaderboard() {
    io.emit('leaderboard', Object.values(users).sort( (a, b) => a.score < b.score ? 1 : -1 ) )
}

// random integer between low (inclusive) and high (exclusive)
function randBetween(low, high) {
    return Math.floor(Math.random() * (high-low)) + low;
}

const nameConfig = {
    dictionaries: [ [...adjectives, ...colors], animals],
    separator: '-',
};

// Setup

refreshNum();
