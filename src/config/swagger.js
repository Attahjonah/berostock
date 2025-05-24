const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

require('dotenv').config();

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BeRoStock API Documentation',
      version: '1.0.0',
      description: 'API documentation for BeRoStock',
      contact: {
        name: 'BennyRose Nig. Ltd',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 2025}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: [
    './src/docs/swagger/*.swagger.js',
    './src/routes/*.js',
  ],
};

const specs = swaggerJsDoc(options);

module.exports = {
  swaggerUi,
  specs,
};