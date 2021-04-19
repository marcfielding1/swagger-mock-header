# swagger-mock-header
Express middleware for generating mocking responses based on swagger.

The purpose of this example is to show a super lightweight implementation of an express middleware that will return a response body based on the x-mock-header value found in openapi.yaml specifications.

A much more heavyweight example of this can be found here: https://github.com/APIDevTools/swagger-express-middleware

### Getting Started

Consider the following specification:

```
openapi: 3.0.3
info:
  title: Appeals Service API Documentation
  description:
    Description
  version: 1.0.3
  license:
    name: MIT
    url: 'https://opensource.org/licenses/MIT'
servers:
  - url: 'http://localhost:3000/'
paths:
  '/api/v1/appeals':
    post:
      summary: Creates a new appeal
      description: A newly created appeal will have a DRAFT state and all subsections will have NOT STARTED state. The id will be a uuid and the returned representation of the new appeal will be valid so it can be submitted as a PUT payload 'as is'.
      tags:
        - Appeals
      responses:
        '201':
          description: Returns a newly created appeal
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Appeal'
```              

By calling the above endpoint with x-mock-header set to the response code you want it'll return the values from the content section using the "example" values in the component.

The is useful to unblock frontend teams/app develop teams while backend work is being implemented and also for e2e tests where you simply need to mock a response from another service.

