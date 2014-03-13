var express = require('express');
// path - http://nodejs.org/api/path.html
var path = require('path');
// request - allow us to hit other REST api's 
var request = require('request');
var async = require('async');

var routes = require("./routes");
// mongo 
var mongoose = require('mongoose');

//Use the top Uri if running in heroku. Use bottom one if running locally.

//var mongoUri = process.env.MONGOLAB_URI;
var mongoUri = 'mongodb://heroku_app22854962:4lklfpqm26kinofbfla6m7alpk@ds033459.mongolab.com:33459/heroku_app22854962';
mongoose.connect(mongoUri, function (err, res) {
  if (err) {
    console.log ('Error connecting to Mongolab: ' + err);
  }
  else {
    console.log ('Succeeded');
  }
});

var spaceSchema = new mongoose.Schema({
  UUID: {type: Number, min:0},
  name: String, 
  address: String,
  coordinate: {
    lat: Number,
    lng: Number},
  price: Number,
  startTime: Number,
  endTime: Number,
  reserved: Boolean
});

var Space = mongoose.model('spaces', spaceSchema);

var app = express();
// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session({ secret: 'super-duper-secret-secret' }));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'static'))); 

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}
app.get('/', routes.index);

//add a space to database
app.post('/add', function(req, res) {
  body = req.body;
  
  var name = body.name,
      address = body.address,
      price = body.price,
      startTime = body.startTime,
      endTime = body.endTime;


  if (!name) {
    errorResponse("Invalid /add: No Name", res);
  }
  if (!address) {
    errorResponse("Invalid /add: No Address", res);
  }
  if (!price) {
    errorResponse("Invalid /add: No Price", res);
  }
  if (!startTime) {
    errorResponse("Invalid /add: No Start Time", res);
  }
  if (!endTime) {
    errorResponse("Invalid /add: No End Time", res);
  }

  var nextId = Space.find().count(function(err, count) {
    nextId = count + 1;
  });
  // geocodable address
  var geoAddress = address.split(' ').join('+');

  var domain = 'http://maps.googleapis.com/maps/api/geocode/json?';
  var options = 'address=' + geoAddress + '&sensor=false';
  
 request(domain + options, function (error, response, body) {
    
    if (!error && response.statusCode == 200) {
      var json = JSON.parse(body);
      if (json.status === "OK") {
        location = json.results[0].geometry.location;
        formattedAddress = json.results[0].formatted_address;

        var newSpace = new Space ({
          UUID: nextId,
          name : name,
          address : formattedAddress,
          coordinate: { lat: location.lat, lng: location.lng },
          price : price,
          startTime : startTime,
          endTime : endTime,
          reserved : false
        });
        newSpace.save(function (err) {
          if (err) {
            console.log("Error writing new space to database");
          }
        });
        // add to spaces collection
      }
    else {
      errorResponse("Error geocoding", res);
    }
  }
});
}); // end app.post()

function errorResponse(error, res) {
  console.log(error);
  var response = {
    "status": error
  }
  res.json(response);
}
var http = require('http');
http.createServer(app).listen(app.get('port'), function(){
  console.log('Parking app server listening on port ' + app.get('port'));
});
