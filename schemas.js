var mongoose = require('mongoose')
  , Schema = mongoose.Schema

Game = new Schema({
    players: [String]
  , boardRepresentation: String //json object
})

AvailablePlayer = new Schema({
  username: String
})

mongoose.model('Game', Game)
mongoose.model('AvailablePlayer', AvailablePlayer)