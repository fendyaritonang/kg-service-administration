const express = require('express');
const mongoose = require('./db/mongoose');
const cookieParser = require('cookie-parser');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const churchRouter = require('./routers/church');
const serviceRouter = require('./routers/service');
const BRAND_SHORT = process.env.BRAND_SHORT || 'Ompusunggu';
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const corsOptions = {
  origin: true,
  methods: ['POST', 'PUT', 'DELETE', 'PATCH', 'GET'],
  credentials: true,
  maxAge: 3600,
};

let app = express();
app.mongoose = mongoose;
app.use(cors(corsOptions));
app.use(cookieParser());

const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: `${BRAND_SHORT} Administration Service`,
      description: `Documentation of ${BRAND_SHORT} Administration Service API`,
      contact: {
        name: `${BRAND_SHORT}`,
      },
    },
  },
  apis: ['src/routers/*.js'],
};

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

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
