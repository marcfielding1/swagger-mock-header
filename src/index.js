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
}
