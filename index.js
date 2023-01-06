const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server);

// STATE

  let users = {};

// IO

app.get('/', (req, res) => {
    res.sendFile('index.html', { root: __dirname });
});

app.use(express.static(__dirname + '/public'));

io.on('connection', socket => {
    console.log('A user connected ' + socket.id);

    users[socket.id] = uniqueNamesGenerator(nameConfig);
    io.emit('count', Object.keys(users).length);

    socket.emit('init', {
       low: low,
       high: high,
       name: users[socket.id]
    });

    socket.on('guess', (data) => {
        console.log(data);
        if (data == num) {
            console.log('correct');
            io.emit('correct', { user: users[socket.id], num: num });
            refreshNum();
        }
        else {
            io.emit('guess', { user: users[socket.id], guess: data, judgement: (data < num) ? 'too low' : 'too high' });
        }
    })

    socket.on('disconnect', () => {
        console.log('A user disconnected');
        delete users[socket.id];
        io.emit('count', Object.keys(users).length);
    })
})

server.listen(3000, () => {
    console.log('listening on *:3000');
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

// random integer between low (inclusive) and high (exclusive)
function randBetween(low, high) {
    return Math.floor(Math.random() * (high-low)) + low;
}

const { uniqueNamesGenerator, adjectives, colors, animals } = require('unique-names-generator');

const nameConfig = {
    dictionaries: [ [...adjectives, ...colors], animals],
    separator: '-',
};

// Setup

refreshNum();
