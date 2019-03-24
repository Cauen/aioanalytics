var express = require('express');
var app = express();
var cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const config = require('./DB');

// Connect DB
mongoose.Promise = global.Promise;
mongoose.connect(config.DB, { useNewUrlParser: true }).then(
  () => { console.log('Database is connected') },
  err => { console.log('Can not connect to the database' + err) }
);


app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(cors());

//Routes
const AdminRoute = require('./routes/admin.route');
const authRoute = require('./routes/auth.route');
const userRoute = require('./routes/user.route');

// Public User Registration and Login Routes
app.use(    '/auth',                                        authRoute);

// User Routes
app.post(   '/admin/add',                    				AdminRoute.addUser);

// User Routes
app.post(   '/user/track',                    				userRoute.trackEvent);
app.get(   	'/user/all',                    					userRoute.usersWithEvents);
app.post(		'/user/data', 														userRoute.userWithEvents);
app.post(		'/user/identify', 												userRoute.anonIdentified);

app.use("/aio.js", express.static(__dirname + '/aio.js'));
app.use("/a*", express.static(__dirname + '/test.html'));
app.get('/r*', function (req, res) {
	res.send(`<!DOCTYPE html>
	  <html>
	  <head>
		  <title>Meu site</title>
	  </head>
	  <body>
	  	Campanha Google PPC <a href="http://192.168.1.7:3000/a?utm_src=google&utm_medium=ppc">link</a><br>
	    Campanha Facebook PPC <a href="http://192.168.1.7:3000/a?utm_src=facebook&utm_medium=ppc">link</a><br>
	    Campanha Externa <a href="http://192.168.1.7:3000/a?utm_src=refer&utm_content=post-1-blog">link</a><br>
	  </body>
	  </html>`);
})

app.post('/', function (req, res) {
	var device_id = req.body.aio_device_id;
	var origin =  req.headers.referer || 'Acesso direto';

  	res.status(200).json(JSON.stringify(req.body));
});

// Server
const port = process.env.PORT || 3000;
const server = app.listen(port, '0.0.0.0');