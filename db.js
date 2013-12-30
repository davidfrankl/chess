var mongoose = require('mongoose')

var uristring = 
  process.env.MONGOLAB_URI || 
  process.env.MONGOHQ_URL || 
  'mongodb://127.0.0.1/chess'

mongoose.connect(uristring, function (err, res) {
  if (err) { 
    console.log ('ERROR connecting to: '+uristring+": " + err);
  } else {
    console.log ('Succeeded connected to: '+uristring);
  }
});
