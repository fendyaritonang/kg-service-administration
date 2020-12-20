const express = require('express');
const Church = require('../models/church');
const auth = require('../middleware/auth');
const router = new express.Router();
const logging = require('../utils/logging');

/**
 * @swagger
 * tags:
 * -  name: "church"
 *    description: "Church endpoints"
 * -  name: "servants"
 *    description: "Church Servants endpoints"
 * -  name: "locations"
 *    description: "Church location endpoints"
 * -  name: "service"
 *    description: "Church Service endpoints"
 * definitions:
 *  Church:
 *      type: "object"
 *      properties:
 *          _id:
 *              type: "string"
 *              example: "5ebe3126f2c8bd30b8525166"
 *          status:
 *              type: "integer"
 *              example: "1"
 *          code:
 *              type: "string"
 *              example: "hkbps"
 *          name:
 *              type: "string"
 *              example: "HKBP Singapore"
 *          address:
 *              type: "string"
 *              example: "8 Short Street Singapore"
 *          timeOffset:
 *              type: "integer"
 *              example: "420"
 *          admins:
 *              type: "array"
 *              items:
 *                  $ref: "#/definitions/Admins"
 *          servants:
 *              type: "array"
 *              items:
 *                  $ref: "#/definitions/Servants"
 *          locations:
 *              type: "array"
 *              items:
 *                  $ref: "#/definitions/Locations"
 *  ChurchHeader:
 *      type: "object"
 *      properties:
 *          code:
 *              type: "string"
 *              example: "hkbps"
 *          name:
 *              type: "string"
 *              example: "HKBP Singapore"
 *          address:
 *              type: "string"
 *              example: "8 Short Street Singapore"
 *          timeOffset:
 *              type: "integer"
 *              example: "420"
 *  Admins:
 *      type: "object"
 *      properties:
 *        admin:
 *          type: "string"
 *          example: "admin@gmaaail.com"
 *  Locations:
 *      type: "object"
 *      properties:
 *        code:
 *          type: "string"
 *          example: "ruang_utama"
 *        location:
 *          type: "string"
 *          example: "Ruang Utama Gereja"
 *  Servants:
 *      type: "object"
 *      properties:
 *        email:
 *          type: "string"
 *          format: "email"
 *          example: "admin@gmaaail.com"
 *        name:
 *          type: "string"
 *          example: "John Doe"
 *        role:
 *          type: "string"
 *          example: "Pendeta"
 *  Service:
 *      type: "object"
 *      properties:
 *        churchCode:
 *          type: "string"
 *          example: "hkbps"
 *        title:
 *          type: "string"
 *          example: "Minggu Trinitatis"
 *        status:
 *          type: "string"
 *          example: "1"
 *        datetimeStart:
 *          type: "string"
 *          example: "1900-01-01T00:00:00Z"
 *        datetimeEnd:
 *          type: "string"
 *          example: "1900-01-01T00:00:00Z"
 *        locationCode:
 *          type: "string"
 *          example: "ruang_utama"
 *        locationName:
 *          type: "string"
 *          example: "Ruang Utama Gereja Lantai 1 (optional)"
 *        reflection:
 *          type: "string"
 *          example: "Service reflection (optional)"
 *        remarks:
 *          type: "string"
 *          example: "Service remarks (optional)"
 *        liturgy:
 *          type: "array"
 *          items:
 *            $ref: "#/definitions/Liturgy"
 *        servants:
 *          type: "array"
 *          items:
 *            $ref: "#/definitions/ServiceServants"
 *        news:
 *          type: "array"
 *          items:
 *            $ref: "#/definitions/News"
 *  ServiceHeader:
 *      type: "object"
 *      properties:
 *        churchCode:
 *          type: "string"
 *          example: "hkbps"
 *        title:
 *          type: "string"
 *          example: "Minggu Trinitatis"
 *        status:
 *          type: "string"
 *          example: "1"
 *        datetimeStart:
 *          type: "string"
 *          example: "1900-01-01T00:00:00Z"
 *        datetimeEnd:
 *          type: "string"
 *          example: "1900-01-01T00:00:00Z"
 *        locationCode:
 *          type: "string"
 *          example: "ruang_utama"
 *        locationName:
 *          type: "string"
 *          example: "Ruang Utama Gereja Lantai 1 (optional)"
 *        reflection:
 *          type: "string"
 *          example: "Service reflection (optional)"
 *        remarks:
 *          type: "string"
 *          example: "Service remarks (optional)"
 *  News:
 *      type: "object"
 *      properties:
 *        title:
 *          type: "string"
 *          example: "Birthday of John Doe"
 *        content:
 *          type: "string"
 *          example: "Anything about the birthday of John Doe"
 *        link:
 *          type: "string"
 *          example: "https://alkitab.app/BN/1"
 *  Liturgy:
 *      type: "object"
 *      properties:
 *        title:
 *          type: "string"
 *          example: "Votum - Introitus - Doa"
 *        titleLink:
 *          type: "string"
 *          example: "https://alkitab.app/BN/1"
 *        content:
 *          type: "string"
 *          example: "Liturgy content"
 *        contentLink:
 *          type: "string"
 *          example: "https://alkitab.app/BN/1"
 *  ServiceServants:
 *      type: "object"
 *      properties:
 *        email:
 *          type: "string"
 *          format: "email"
 *          example: "admin@gmaaail.com"
 *        name:
 *          type: "string"
 *          example: "John Doe"
 *        serviceRole:
 *          type: "string"
 *          example: "Pendeta"
 *        servantRole:
 *          type: "string"
 *          example: "Pendeta"
 *
 * */

/**
 * @swagger
 * /v1/church/register:
 *  post:
 *      tags:
 *      - "church"
 *      summary: Church registration
 *      description: Endpoint to allow a user to register a new church
 *      parameters:
 *          -   in: "body"
 *              name: "body"
 *              required: true
 *              schema:
 *                  type: "object"
 *                  required:
 *                  -   "code"
 *                  -   "name"
 *                  -   "address"
 *                  properties:
 *                      code:
 *                          type: "string"
 *                          example: "hkbps"
 *                      name:
 *                          type: "string"
 *                          example: "HKBP Singapore"
 *                      address:
 *                          type: "string"
 *                          example: "8 Short Street Singapore"
 *                      timeOffset:
 *                          type: "integer"
 *                          example: "420"
 *      responses:
 *          '201':
 *              description: Successfully created a new church.
 *              schema:
 *                  type: "object"
 *                  properties:
 *                      church:
 *                          type: "object"
 *                          $ref: "#/definitions/Church"
 *          '400':
 *              description: Error, invalid input
 */
router.post('/v1/church/register', auth, async (req, res) => {
  try {
    const search = await Church.findOne({
      $or: [{ code: req.body.code }, { name: req.body.name }],
    });

    if (search) {
      throw new Error('Church code or name already exist');
    }

    let church = new Church({
      code: req.body.code,
      name: req.body.name,
      address: req.body.address,
      timeOffset: req.body.timeOffset,
    });
    church.admins.push({ admin: req.user.email });
    await church.save();

    res.status(201).send(church);
  } catch (e) {
    logging.routerErrorLog(req, e.toString());
    res.status(400).send();
  }
});

/**
 * @swagger
 * /v1/church/update/{churchcode}:
 *  patch:
 *      tags:
 *      - "church"
 *      summary: Church update
 *      description: Endpoint to update church name and address
 *      parameters:
 *          -   in: "path"
 *              name: "churchcode"
 *              description: "Church Code"
 *              required: true
 *              type: "string"
 *          -   in: "body"
 *              name: "body"
 *              required: true
 *              schema:
 *                  type: "object"
 *                  required:
 *                  -   "name"
 *                  -   "address"
 *                  properties:
 *                      name:
 *                          type: "string"
 *                          example: "HKBP Singapore"
 *                      address:
 *                          type: "string"
 *                          example: "8 Short Street Singapore"
 *      responses:
 *          '200':
 *              description: Successfully updated church name and address
 *              schema:
 *                  type: "object"
 *                  properties:
 *                      church:
 *                          type: "object"
 *                          $ref: "#/definitions/Church"
 *          '400':
 *              description: Error, invalid input
 */
router.patch('/v1/church/update/:churchcode', auth, async (req, res) => {
  const churchCode = req.params.churchcode;
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'address'];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  try {
    if (!isValidOperation) {
      throw new Error('Invalid update!');
    }

    const church = await Church.isChurchAdmin(churchCode, req.user.email);
    if (!church) {
      throw new Error('Only church admin able to perform this operation');
    }

    updates.forEach((update) => (church[update] = req.body[update]));
    await church.save();

    res.status(200).send(church);
  } catch (e) {
    logging.routerErrorLog(req, e.toString());
    res.status(400).send();
  }
});

/**
 * @swagger
 * /v1/church:
 *  get:
 *      tags:
 *      - "church"
 *      summary: Church list under admin care
 *      description: Endpoint to list churches under admin care
 *      responses:
 *          '200':
 *              description: Successfully listed churches under admin care.
 *              schema:
 *                  type: "array"
 *                  items:
 *                      $ref: "#/definitions/ChurchHeader"
 *          '400':
 *              description: Error, invalid input
 */
router.get('/v1/church', auth, async (req, res) => {
  try {
    const church = await Church.find(
      {
        'admins.admin': req.user.email,
      },
      'code name address timeOffset'
    );

    res.status(200).send(church);
  } catch (e) {
    logging.routerErrorLog(req, e.toString());
    res.status(400).send();
  }
});

/**
 * @swagger
 * /v1/church/detail/{churchcode}:
 *  get:
 *      tags:
 *      - "church"
 *      summary: Church list under admin care
 *      description: Endpoint to list churches under admin care
 *      parameters:
 *          -   in: "path"
 *              name: "churchcode"
 *              description: "Church Code"
 *              required: true
 *              type: "string"
 *      responses:
 *          '200':
 *              description: Successfully listed churches under admin care.
 *              schema:
 *                  type: "array"
 *                  items:
 *                      $ref: "#/definitions/Church"
 *          '400':
 *              description: Error, invalid input
 */
router.get('/v1/church/detail/:churchcode', auth, async (req, res) => {
  const churchCode = req.params.churchcode;
  try {
    const church = await Church.isChurchAdmin(churchCode, req.user.email);
    if (!church) {
      throw new Error('Only church admin able to perform this operation');
    }

    res.status(200).send({
      _id: church._id,
      code: church.code,
      name: church.name,
      status: church.status,
      address: church.address,
      timeOffset: church.timeOffset,
      admins: church.admins,
      servants: church.servants,
      locations: church.locations,
    });
  } catch (e) {
    logging.routerErrorLog(req, e.toString());
    res.status(400).send();
  }
});

/**
 * @swagger
 * /v1/church/servants/{churchcode}:
 *  post:
 *      tags:
 *      - "servants"
 *      summary: Add new church servant
 *      description: Endpoint to add new church servant
 *      parameters:
 *          -   in: "path"
 *              name: "churchcode"
 *              description: "Church Code"
 *              required: true
 *              type: "string"
 *          -   in: "body"
 *              name: "body"
 *              required: true
 *              schema:
 *                  type: "object"
 *                  required:
 *                  -   "email"
 *                  -   "name"
 *                  -   "role"
 *                  properties:
 *                      name:
 *                          type: "string"
 *                          example: "John Doe"
 *                      email:
 *                          type: "string"
 *                          format: "email"
 *                          example: "john@gmaail.com"
 *                      role:
 *                          type: "string"
 *                          example: "Pendeta"
 *      responses:
 *          '200':
 *              description: Successfully added new church servant
 *              schema:
 *                  type: "object"
 *                  properties:
 *                      churchCode:
 *                          type: "string"
 *                          example: "hkbps"
 *                      servants:
 *                          type: "array"
 *                          items:
 *                              $ref: "#/definitions/Servants"
 *          '400':
 *              description: Error, invalid input
 */
router.post('/v1/church/servants/:churchcode', auth, async (req, res) => {
  const churchCode = req.params.churchcode;

  try {
    const church = await Church.isChurchAdmin(churchCode, req.user.email);
    if (!church) {
      throw new Error('Only church admin able to perform this operation');
    }

    const isDuplicate = church.servants.filter(
      (o) => o.email === req.body.email
    );

    if (isDuplicate && isDuplicate.length > 0) {
      throw new Error('Servant already exist!');
    }

    church.servants = church.servants.concat({
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
    });

    await church.save();

    res.status(200).send({
      churchCode,
      servants: church.servants,
    });
  } catch (e) {
    logging.routerErrorLog(req, e.toString());
    res.status(400).send();
  }
});

/**
 * @swagger
 * /v1/church/servants/{churchcode}:
 *  patch:
 *      tags:
 *      - "servants"
 *      summary: Modify church servant data
 *      description: Endpoint to modify church servant data
 *      parameters:
 *          -   in: "path"
 *              name: "churchcode"
 *              description: "Church Code"
 *              required: true
 *              type: "string"
 *          -   in: "body"
 *              name: "body"
 *              required: true
 *              schema:
 *                  type: "object"
 *                  required:
 *                  -   "email"
 *                  -   "name"
 *                  -   "role"
 *                  properties:
 *                      name:
 *                          type: "string"
 *                          example: "John Doe"
 *                      email:
 *                          type: "string"
 *                          format: "email"
 *                          example: "john@gmaail.com"
 *                      role:
 *                          type: "string"
 *                          example: "Pendeta"
 *      responses:
 *          '200':
 *              description: Successfully modified church servant data
 *              schema:
 *                  type: "object"
 *                  properties:
 *                      churchCode:
 *                          type: "string"
 *                          example: "hkbps"
 *                      servants:
 *                          type: "array"
 *                          items:
 *                              $ref: "#/definitions/Servants"
 *          '400':
 *              description: Error, invalid input
 */
router.patch('/v1/church/servants/:churchcode', auth, async (req, res) => {
  const churchCode = req.params.churchcode;

  try {
    const church = await Church.isChurchAdmin(churchCode, req.user.email);
    if (!church) {
      throw new Error('Only church admin able to perform this operation');
    }

    const doesExist = church.servants.filter((o) => o.email === req.body.email);

    if (!doesExist || doesExist.length === 0) {
      throw new Error('Servant does not exist!');
    }

    const servantIndex = church.servants.findIndex(
      (item) => item.email === req.body.email
    );
    church.servants[servantIndex].name = req.body.name;
    church.servants[servantIndex].role = req.body.role;

    await church.save();

    res.status(200).send({
      churchCode,
      servants: church.servants,
    });
  } catch (e) {
    logging.routerErrorLog(req, e.toString());
    res.status(400).send();
  }
});

/**
 * @swagger
 * /v1/church/servants/{churchcode}:
 *  delete:
 *      tags:
 *      - "servants"
 *      summary: Remove or inactivate church servant
 *      description: Endpoint to remove or inactivate church servant
 *      parameters:
 *          -   in: "path"
 *              name: "churchcode"
 *              description: "Church Code"
 *              required: true
 *              type: "string"
 *          -   in: "body"
 *              name: "body"
 *              required: true
 *              schema:
 *                  type: "object"
 *                  required:
 *                  -   "email"
 *                  properties:
 *                      email:
 *                          type: "string"
 *                          format: "email"
 *                          example: "john@gmaail.com"
 *      responses:
 *          '200':
 *              description: Successfully modified church servant data
 *              schema:
 *                  type: "object"
 *                  properties:
 *                      churchCode:
 *                          type: "string"
 *                          example: "hkbps"
 *                      servants:
 *                          type: "array"
 *                          items:
 *                              $ref: "#/definitions/Servants"
 *          '400':
 *              description: Error, invalid input
 */
router.delete('/v1/church/servants/:churchcode', auth, async (req, res) => {
  const churchCode = req.params.churchcode;

  try {
    const church = await Church.isChurchAdmin(churchCode, req.user.email);
    if (!church) {
      throw new Error('Only church admin able to perform this operation');
    }

    const doesExist = church.servants.filter((o) => o.email === req.body.email);

    if (!doesExist || doesExist.length === 0) {
      throw new Error('Servant does not exist!');
    }

    const servantIndex = church.servants.findIndex(
      (item) => item.email === req.body.email
    );
    church.servants[servantIndex].status = 0;

    await church.save();

    res.status(200).send({
      churchCode,
      servants: church.servants,
    });
  } catch (e) {
    logging.routerErrorLog(req, e.toString());
    res.status(400).send();
  }
});

/**
 * @swagger
 * /v1/church/servants/{churchcode}:
 *  get:
 *      tags:
 *      - "servants"
 *      summary: List of church servants under admin care
 *      description: Endpoint to list of church servants under admin care
 *      parameters:
 *          -   in: "path"
 *              name: "churchcode"
 *              description: "Church Code"
 *              required: true
 *              type: "string"
 *      responses:
 *          '200':
 *              description: Successfully listed church servants under admin care
 *              schema:
 *                  type: "object"
 *                  properties:
 *                      churchCode:
 *                          type: "string"
 *                          example: "hkbps"
 *                      servants:
 *                          type: "array"
 *                          items:
 *                              $ref: "#/definitions/Servants"
 *          '400':
 *              description: Error, invalid input
 */
router.get('/v1/church/servants/:churchcode', auth, async (req, res) => {
  const churchCode = req.params.churchcode;
  try {
    const church = await Church.isChurchAdmin(churchCode, req.user.email);
    if (!church) {
      throw new Error('Only church admin able to perform this operation');
    }
    res.status(200).send({ churchCode, servants: church.servants });
  } catch (e) {
    logging.routerErrorLog(req, e.toString());
    res.status(400).send();
  }
});

/**
 * @swagger
 * /v1/church/locations/{churchcode}:
 *  post:
 *      tags:
 *      - "locations"
 *      summary: Add new church location
 *      description: Endpoint to add new church location
 *      parameters:
 *          -   in: "path"
 *              name: "churchcode"
 *              description: "Church Code"
 *              required: true
 *              type: "string"
 *          -   in: "body"
 *              name: "body"
 *              required: true
 *              schema:
 *                  type: "object"
 *                  required:
 *                  -   "code"
 *                  -   "location"
 *                  properties:
 *                      code:
 *                          type: "string"
 *                          example: "ruang_utama"
 *                      location:
 *                          type: "string"
 *                          example: "Ruang Utama"
 *      responses:
 *          '200':
 *              description: Successfully added new church location
 *              schema:
 *                  type: "object"
 *                  properties:
 *                      churchCode:
 *                          type: "string"
 *                          example: "hkbps"
 *                      locations:
 *                          type: "array"
 *                          items:
 *                              $ref: "#/definitions/Locations"
 *          '400':
 *              description: Error, invalid input
 */
router.post('/v1/church/locations/:churchcode', auth, async (req, res) => {
  const churchCode = req.params.churchcode;

  try {
    const church = await Church.isChurchAdmin(churchCode, req.user.email);
    if (!church) {
      throw new Error('Only church admin able to perform this operation');
    }

    const isDuplicate = church.locations.filter(
      (o) => o.code === req.body.code
    );

    if (isDuplicate && isDuplicate.length > 0) {
      throw new Error('Church location code already exist!');
    }

    church.locations = church.locations.concat({
      code: req.body.code,
      location: req.body.location,
    });

    await church.save();

    res.status(200).send({
      churchCode,
      locations: church.locations,
    });
  } catch (e) {
    logging.routerErrorLog(req, e.toString());
    res.status(400).send();
  }
});

/**
 * @swagger
 * /v1/church/locations/{churchcode}:
 *  patch:
 *      tags:
 *      - "locations"
 *      summary: Modify church location
 *      description: Endpoint to modify church location
 *      parameters:
 *          -   in: "path"
 *              name: "churchcode"
 *              description: "Church Code"
 *              required: true
 *              type: "string"
 *          -   in: "body"
 *              name: "body"
 *              required: true
 *              schema:
 *                  type: "object"
 *                  required:
 *                  -   "code"
 *                  -   "location"
 *                  properties:
 *                      code:
 *                          type: "string"
 *                          example: "ruang_utama"
 *                      location:
 *                          type: "string"
 *                          example: "Ruang Utama"
 *      responses:
 *          '200':
 *              description: Successfully modified church location
 *              schema:
 *                  type: "object"
 *                  properties:
 *                      churchCode:
 *                          type: "string"
 *                          example: "hkbps"
 *                      locations:
 *                          type: "array"
 *                          items:
 *                              $ref: "#/definitions/Locations"
 *          '400':
 *              description: Error, invalid input
 */
router.patch('/v1/church/locations/:churchcode', auth, async (req, res) => {
  const churchCode = req.params.churchcode;

  try {
    const church = await Church.isChurchAdmin(churchCode, req.user.email);
    if (!church) {
      throw new Error('Only church admin able to perform this operation');
    }

    const doesExist = church.locations.filter((o) => o.code === req.body.code);

    if (!doesExist || doesExist.length === 0) {
      throw new Error('Location code does not exist!');
    }

    const servantIndex = church.locations.findIndex(
      (item) => item.email === req.body.email
    );
    church.locations[servantIndex].location = req.body.location;

    await church.save();

    res.status(200).send({
      churchCode,
      locations: church.locations,
    });
  } catch (e) {
    logging.routerErrorLog(req, e.toString());
    res.status(400).send();
  }
});

/**
 * @swagger
 * /v1/church/locations/{churchcode}:
 *  delete:
 *      tags:
 *      - "locations"
 *      summary: Remove or inactivate church location
 *      description: Endpoint to remove or inactivate church location
 *      parameters:
 *          -   in: "path"
 *              name: "churchcode"
 *              description: "Church Code"
 *              required: true
 *              type: "string"
 *          -   in: "body"
 *              name: "body"
 *              required: true
 *              schema:
 *                  type: "object"
 *                  required:
 *                  -   "code"
 *                  properties:
 *                      code:
 *                          type: "string"
 *                          example: "ruang_utama"
 *      responses:
 *          '200':
 *              description: Successfully modified church location
 *              schema:
 *                  type: "object"
 *                  properties:
 *                      churchCode:
 *                          type: "string"
 *                          example: "hkbps"
 *                      locations:
 *                          type: "array"
 *                          items:
 *                              $ref: "#/definitions/Locations"
 *          '400':
 *              description: Error, invalid input
 */
router.delete('/v1/church/locations/:churchcode', auth, async (req, res) => {
  const churchCode = req.params.churchcode;

  try {
    const church = await Church.isChurchAdmin(churchCode, req.user.email);
    if (!church) {
      throw new Error('Only church admin able to perform this operation');
    }

    const doesExist = church.locations.filter((o) => o.code === req.body.code);

    if (!doesExist || doesExist.length === 0) {
      throw new Error('Location does not exist!');
    }

    const locationIndex = church.locations.findIndex(
      (item) => item.code === req.body.code
    );
    church.locations[locationIndex].status = 0;

    await church.save();

    res.status(200).send({
      churchCode,
      locations: church.locations,
    });
  } catch (e) {
    logging.routerErrorLog(req, e.toString());
    res.status(400).send();
  }
});

/**
 * @swagger
 * /v1/church/locations/{churchcode}:
 *  get:
 *      tags:
 *      - "locations"
 *      summary: List of church locations under admin care
 *      description: Endpoint to list of church locations under admin care
 *      parameters:
 *          -   in: "path"
 *              name: "churchcode"
 *              description: "Church Code"
 *              required: true
 *              type: "string"
 *      responses:
 *          '200':
 *              description: Successfully listed church locations under admin care
 *              schema:
 *                  type: "object"
 *                  properties:
 *                      churchCode:
 *                          type: "string"
 *                          example: "hkbps"
 *                      servants:
 *                          type: "array"
 *                          items:
 *                              $ref: "#/definitions/Servants"
 *          '400':
 *              description: Error, invalid input
 */
router.get('/v1/church/locations/:churchcode', auth, async (req, res) => {
  const churchCode = req.params.churchcode;
  try {
    const church = await Church.isChurchAdmin(churchCode, req.user.email);
    if (!church) {
      throw new Error('Only church admin able to perform this operation');
    }
    res.status(200).send({ churchCode, locations: church.locations });
  } catch (e) {
    logging.routerErrorLog(req, e.toString());
    res.status(400).send();
  }
});

module.exports = router;
