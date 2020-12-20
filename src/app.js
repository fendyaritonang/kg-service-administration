const express = require('express');
const mongoose = require('./db/mongoose');
const cookieParser = require('cookie-parser');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const churchRouter = require('./routers/church');
const serviceRouter = require('./routers/service');
const cors = require('cors');

let app = express();
app.mongoose = mongoose;
app.use(cors());
app.use(cookieParser());

const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: 'KG Administration Service',
      description: 'Documentation of KG Administration Service API',
      contact: {
        name: 'KG',
      },
    },
    securityDefinitions: {
      JWT: {
        description:
          'Please copy and paste the token with prefix "Bearer " in input box.',
        type: 'apiKey',
        name: 'Authorization',
        in: 'header',
      },
    },
  },
  apis: ['src/routers/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

// Swagger UI for localhost
app.use(
  '/administration-api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocs)
);

app.use(express.json());
app.use(churchRouter);
app.use(serviceRouter);

module.exports = app;
