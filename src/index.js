const SwaggerParser = require('@apidevtools/swagger-parser');
const fs = require('fs');

let swagger;
let initialized = false;
let logger;
let config;

/* eslint consistent-return: 0 */
const mockMiddleWare = (req, res, next) => {
  if (initialized === false) {
    logger.err('Swagger Mock middleware not initialized');
    next();
  }

  if (req.headers['x-mock-header']) {
    console.log('api def', swagger); // TODO: debug statement remove.

    const { method } = req; // GET, POST etc
    const requestUrl = req.baseUrl + req.path; // Path without URL params
    const apiSpec = swagger[requestUrl]; // This gets the overarching object for that path.
    const requestedResponse = req.headers['x-mock-header']; // this tells us if we're returning a mocked response. IE x-mock-header: 200
    const methodSpec = apiSpec[method.toLowerCase()]; // the actual object relating to the path AND method.

    const responses = Object.keys(methodSpec.responses);

    // check if under responses the response code exists.
    if (!responses.includes(method)) {
      logger.debug(`Response code ${requestedResponse} is not included in the API spec.`);
      return next();
    }

    // now we know it exists we need to pull out the content. Swagger parser resolves $ref's on it's own

    const response = methodSpec[method]?.responses[requestedResponse]?.content; // TODO: rename this variable.

    // nothing defined, nothing retuned.
    if (!response) {
      logger.err(`No mock response available for requested code. ${requestedResponse}`);
      return next();
    }

    // return the example response from the API spec.
    return res.json(response);
  }
};

const init = async (conf) => {
  try {
    config = conf;

    swagger = await SwaggerParser.validate(fs.readFileSync(config.swaggerFilePath, 'utf8'));

    // some express apps have their own logging functions so.....
    if (config.log) {
      logger.error = config.log.err;
      logger.warn = config.log.warn;
      logger.debug = config.log.debug;
      logger.info = config.log.info;
    } else {
      logger = console;
    }

    initialized = true;
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  mockMiddleWare,
  init,
};
