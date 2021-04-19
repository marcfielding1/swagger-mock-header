const SwaggerParser = require('@apidevtools/swagger-parser');
const fs = require('fs');

export default class MockMiddleware {
  constructor(conf) {
    this.swagger = undefined;
    this.initialized = undefined;
    this.logger = undefined;
    this.config = undefined;
    this.initialize(conf);
  }

  async initialize(conf) {
    try {
      this.config = conf;

      this.swagger = await SwaggerParser.validate(fs.readFileSync(this.config.swaggerFilePath, 'utf8'));

      // some express apps have their own logging functions so..... //TODO: Add error handling
      if (this.config.log) {
        this.logger.error = this.config.log.err;
        this.logger.warn = this.config.log.warn;
        this.logger.debug = this.config.log.debug;
        this.logger.info = this.config.log.info;
      } else {
        this.logger = console;
      }

      this.initialized = true;
    } catch (err) {
      console.log(err);
    }
  }

  /* eslint consistent-return: 0 */
  async middleware(req, res, next) {
    if (this.initialized === false) {
      this.logger.err('Swagger Mock middleware not initialized');
      next();
    }

    if (req.headers['x-mock-header']) {
      console.log('api def', this.swagger);

      const { method } = req; // GET, POST etc
      const requestUrl = req.baseUrl + req.path; // Path without URL params
      const apiSpec = this.swagger[requestUrl]; // This gets the overarching object for that path.
      const requestedResponse = req.headers['x-mock-header']; // this tells us if we're returning a mocked response. IE x-mock-header: 200
      const methodSpec = apiSpec[method.toLowerCase()]; // the actual object relating to the path AND method.

      const responses = Object.keys(methodSpec.responses);

      // check if under responses the response code exists.
      if (!responses.includes(method)) {
        this.logger.debug(`Response code ${requestedResponse} is not included in the API spec.`);
        return next();
      }

      // now we know it exists we need to pull out the content. Swagger parser resolves $ref's on it's own

      const response = methodSpec[method]?.responses[requestedResponse].content; // TODO: rename this variable.

      // nothing defined, nothing retuned.
      if (!response) {
        this.logger.err(`No mock response available for requested code. ${requestedResponse}`);
        return next();
      }

      // return the example response from the API spec.
      return res.json(response);
    }
  }
}
