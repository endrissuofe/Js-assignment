/**
 * Express app setup, kept separate from server.js so it can be
 * imported by tests without opening a port.
 */
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config/env');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors({ origin: config.frontendUrl }));
app.use(express.json({ limit: '10kb' }));
if (config.nodeEnv !== 'test') app.use(morgan('dev'));

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
