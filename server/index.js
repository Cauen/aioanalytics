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


// Auth
require('./config/passport');

//Middlewares
const adminMiddleware = require('./middlewares/isAdmin');

//Routes
const AdminRoute = require('./routes/admin.route');
const authRoute = require('./routes/auth.route');
const authenticationRoute = require('./routes/authentication.route');
const userRoute = require('./routes/user.route');
const projectRoute = require('./routes/project.route');

// Public User Registration and Login Routes
//app.use(    '/auth',                                        authRoute);
app.post ('/login', authenticationRoute.login);
app.post ('/register', authenticationRoute.register);

// User Routes
app.post(   '/admin/add',                    					AdminRoute.addUser);

// User Routes
app.post(   '/user/track',                    				userRoute.trackEvent);
app.post(   '/user/all',                    			  	userRoute.usersWithEvents);
app.post(		'/user/data', 														userRoute.userWithEvents);
app.post(		'/user/identify', 												userRoute.anonIdentified);
app.post(		'/user/increment', 												userRoute.increment);
app.post( 	'/user/setall', 													userRoute.setUsersProject);
app.post(   '/user/delete', 													userRoute.deleteUser);

app.post(   '/project', 					adminMiddleware, 		projectRoute.addProject);
app.get (   '/project', 					adminMiddleware, 		projectRoute.getProjects);
app.post(   '/project/funnel', 		adminMiddleware, 		projectRoute.addFunnel);
app.post(   '/project/funnels',		adminMiddleware, 		projectRoute.getFunnels);

app.use("/aio.js", express.static(__dirname + '/aio.js'));
app.get('/', (req, res) => res.send('AioAnalytics'))

// Server
const port = process.env.PORT || 3000;
const server = app.listen(port, '0.0.0.0');
console.log('Server on, at port ' + port);