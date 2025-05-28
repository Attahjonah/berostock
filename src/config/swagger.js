const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "BeRoStock API Documentation",
      version: "1.0.0",
      description: "API documentation for BeRoStock",
      contact: {
        name: "BennyRose Nig. Ltd",
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 2025}`,
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/docs/swagger/*.swagger.js", "./src/routes/*.js"],
};

const specs = swaggerJsDoc(options);

// ✅ Only export specs (not the whole swaggerUi package)
module.exports = {
  specs,
  swaggerServe: swaggerUi.serve,
  swaggerSetup: swaggerUi.setup,
};
