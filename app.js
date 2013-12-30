var express = require('express')
  , app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server)
  , stylus = require('stylus')
  , mongoose = require('mongoose')
  , db = require('./db')
  , ff = require('ff')

require('./schemas')
var Game = mongoose.model('Game')
  , AvailablePlayer = mongoose.model('AvailablePlayer')

app.set('view engine', 'jade')
app.use(express.bodyParser())
app.use(express.cookieParser());
app.use(express.session({secret: '1234567890QWERTY'}));

app.use(stylus.middleware({
  src: __dirname + '/public',
  debug: true,
  force: true
}));
app.use(express.static(__dirname+'/public'))

var port = process.env.PORT || 3000;
server.listen(port)
console.log('listening on '+port)

app.get('/', function (req, res) {
  res.render('index')
})

var addAvailablePlayer = function (username, next) {
  new AvailablePlayer({
    username: username
  }).save(function (err) {
    next()
  })
}

var removeAvailablePlayer = function (username) {
  AvailablePlayer.remove({ username: username }).exec()
}

var createGame = function (username1, username2, next) {
  var args = Array.prototype.slice.call(arguments);

  var whitePlayer = Math.floor(Math.random()*2)
    , blackPlayer = whitePlayer==0? 1 : 0

  var f = ff(function () {
    console.log('players: '+JSON.stringify([arguments[whitePlayer], arguments[blackPlayer]]))
    new Game({
        players: [args[whitePlayer], args[blackPlayer]]
      // , boardRepresentation: getInitBoardRep()
    }).save(f.slot())
  }, function (err) {
    next({whiteUsername: args[whitePlayer], blackUsername: args[blackPlayer]})
  })
}

io.sockets.on('connection', function (socket) {
  var username = null

  socket.on('createUsernameRequestOpponent', function (data) {
    if(!username) username = data.username
    
    var f = ff(function () {
      AvailablePlayer.find().exec(f.slot())
    }, function (players) {
      if(players.length) {
        var otherUsername = players[0].username

        AvailablePlayer.remove({ _id: players[0]._id }).exec(f.slot())

        createGame(username, otherUsername, function (data) {
          io.sockets.emit('startGame', data)
        })
      } else {
        addAvailablePlayer(username, f.slot())
      }
    })
  })

  socket.on('newMove', function (data) {
    console.log('data: '+JSON.stringify(data))
    socket.broadcast.emit('newMove', data)
  })

  socket.on('disconnect', function () {
    removeAvailablePlayer(username)
  })
});













