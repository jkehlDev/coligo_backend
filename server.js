require('dotenv').config();
const redisClient = require('./App/dataBase/redisClient');
const pgClient = require('./App/dataBase/pgClient');

const express = require('express');
const app = express();

// Use Helmet to ensure minimal security Headers configuration
const helmet = require('helmet');
app.use(helmet());

// Use enforceHttps to force redirection from HTTP to HTTPS
const enforceHttps = require('./App/middlewares/enforceHttps');
app.use(enforceHttps(process.env.PORT_HTTP, process.env.PORT_HTTPS));

// Use morgan module to provide tiny request logger
const morgan = require('morgan');
app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms')
);

// Use cors to manage cors policy
const cors = require('cors');
// Root Route
app.get('/', cors(), (_, response) => {
  response.status(200).json({ msg: 'This is CORS-enabled for all origins!' });
});

// User routes and cors configuration import
const corsUserConfig = require('./config/corsUser.json');
const routerUser = require('./App/routers/user');
// User ROUTES
app.use('/user', cors(corsUserConfig), routerUser);

// Data routes and cors configuration import
const corsDataConfig = require('./config/corsData.json');
const routerData = require('./App/routers/data');
// Data ROUTES
app.use('/data', cors(corsDataConfig), routerData);

// Errors middleware import
const errors = require('./App/middlewares/errors');
// Errors Routes
app.use(errors.error404);
app.use(errors.error500);

// Server instance
app.listen(process.env.PORT_HTTP, () => {
  console.log('LISTEN PORT', process.env.PORT_HTTP);
});

const fs = require('fs');
const options = {
  key: fs.readFileSync('./stl/key.pem'),
  cert: fs.readFileSync('./stl/cert.pem'),
  dhparam: fs.readFileSync('./stl/dh-strong.pem'),
};
const https = require('https');
https.createServer(options, app).listen(process.env.PORT_HTTPS);

// ==============================================================
// CLOSING PROCESS CASE - TO CLOSE PROPERLY DATABASE CLIENT CONNEXION
//
process.stdin.resume(); //so the program will not close instantly

function exitHandler(options, exitCode) {
  // ==============================
  // DO SOMETHING HERE TO CLOSE YOUR DB PROPERLY :
  redisClient.close();
  pgClient
    .close()
    .then(() => console.log('client has disconnected'))
    .catch((err) => console.error('error during disconnection', err.stack));
  // ==============================
  if (options.cleanup) console.log('clean');
  if (exitCode || exitCode === 0) console.log(exitCode);
  if (options.exit) process.exit();
}

//do something when app is closing
process.on('exit', exitHandler.bind(null, { cleanup: true }));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, { exit: true }));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, { exit: true }));
process.on('SIGUSR2', exitHandler.bind(null, { exit: true }));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, { exit: true }));
