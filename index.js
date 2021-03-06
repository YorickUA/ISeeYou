var express = require('express'),
      app = express(),
      http = require('http').Server(app),
      path = require('path'),
      bodyParser = require('body-parser'),
      AWS = require('aws-sdk'),
      glob = require('glob'),
      routes = glob.sync('./Controllers/*.js');

AWS.config.update({region:'eu-west-1'});
AWS.config.setPromisesDependency(null);
 
app.use(bodyParser.json({ limit: '20mb' }));
app.use(express.static(path.join(__dirname, './')));

app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, DELETE, PUT, OPTIONS');
    next();
});

routes.forEach(function(route) {
    require(route)(app);
});


app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, './app/index.html'));
});

http.listen(3000, () => {
    console.log('App listening on port ' + 3000 );
});

