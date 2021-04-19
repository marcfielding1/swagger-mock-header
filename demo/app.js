const cors = require('cors');
const express = require('express');
const MockMiddleware = require('../src/index');

const app = express();
app.use(express.json());

app.use(cors({
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204,
}));

const swaggerMiddleware = new MockMiddleware('../apiSpec/openapi.yml');

app.use(swaggerMiddleware.middleware);

app.get('/example', (req, res) => {

});
