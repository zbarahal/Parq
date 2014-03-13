var express = require('express');
// path - http://nodejs.org/api/path.html
var path = require('path');
// request - allow us to hit other REST api's 
var request = require('request');
var async = require('async');

var routes = require("./routes");
var app = express();
// mongo 
var mongoose = require('mongoose');
var mongoUri = /*'mongodb://heroku_app22854962:4lklfpqm26kinofbfla6m7alpk@ds033459.mongolab.com:33459/heroku_app22854962';*/ process.env.MONGOLAB_URI;
mongoose.connect(mongoUri, function (err, res) {
  if (err) {
    console.log ('Error connecting to: ' + mongoUri + ' ' + err);
  }
  else {
    console.log ('Succeeded');
  }
});
//spacesColl = mongo.db(DB, { safe: true }).collection(COLL)

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
