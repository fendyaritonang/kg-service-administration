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
 * -  name: "administrator"
 *    description: "Church Administrators"
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
 *          status:
 *              type: "integer"
 *              example: "1"
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
 *                      admins:
 *                          type: "array"
 *                          items:
 *                              type: string
 *                              example: "john@gmaail.com"
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
    const { code, name, address, timeOffset, admins } = { ...req.body };

    if (
      !name ||
      name === '' ||
      !code ||
      code === '' ||
      !timeOffset ||
      timeOffset === ''
    ) {
      throw new Error('Compulsory data is not valid');
    }

    const search = await Church.findOne({
      $or: [{ code }, { name }],
    });

    if (search) {
      throw new Error('Church code or name already exist');
    }

    let church = new Church({
      code,
      name,
      address,
      timeOffset,
      status: 1,
    });
    church.admins.push({ admin: req.user.email });

    if (admins && admins.length > 0) {
      admins.forEach((admin) => {
        if (admin !== '' && admin !== req.user.email) {
          church.admins.push({ admin });
        }
      });
    }

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
 *                      timeOffset:
 *                          type: "integer"
 *                          example: "420"
 *                      admins:
 *                          type: "array"
 *                          items:
 *                              type: string
 *                              example: "john@gmaail.com"
 *      responses:
 *          '200':
 *              description: Successfully updated church name and address
 *              schema:
 *                  type: "object"
 *                  properties:
 *                      church:
 *                          type: "object"
 *                          $ref: "#/definitions/ChurchHeader"
 *          '400':
 *              description: Error, invalid input
 */
router.patch('/v1/church/update/:churchcode', auth, async (req, res) => {
  const churchCode = req.params.churchcode;
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'address', 'timeOffset', 'admins'];
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

    church.name = req.body.name;
    church.address = req.body.address;
    church.timeOffset = req.body.timeOffset;

    let newAdmins = [];
    newAdmins.push({ admin: req.user.email });

    if (req.body.admins && req.body.admins.length > 0) {
      req.body.admins.forEach((admin) => {
        if (admin !== '' && admin !== req.user.email) {
          newAdmins.push({ admin });
        }
      });
    }
    church.admins = newAdmins;

    await church.save();

    res.status(200).send({
      _id: church._id,
      code: church.code,
      name: church.name,
      address: church.address,
      timeOffset: church.timeOffset,
      admins: newAdmins,
    });
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
      'code name address timeOffset status'
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
      admins: church.admins.filter((e) => e.admin !== req.user.email),
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
 * /v1/church/reactivate/{churchcode}:
 *  patch:
 *      tags:
 *      - "church"
 *      summary: Reactive a church
 *      description: Endpoint to reactivate a church
 *      parameters:
 *          -   in: "path"
 *              name: "churchcode"
 *              description: "Church Code"
 *              required: true
 *              type: "string"
 *      responses:
 *          '200':
 *              description: Successfully reactivated a church
 *          '400':
 *              description: Error, invalid input
 */
router.patch('/v1/church/reactivate/:churchcode', auth, async (req, res) => {
  const churchCode = req.params.churchcode;
  try {
    const church = await Church.isChurchAdmin(churchCode, req.user.email);
    if (!church) {
      throw new Error('Only church admin able to perform this operation');
    }
    if (church.status !== 0) {
      throw new Error('Church is already active');
    }

    church.status = 1;
    await church.save();

    res.status(200).send();
  } catch (e) {
    logging.routerErrorLog(req, e.toString());
    res.status(400).send();
  }
});

/**
 * @swagger
 * /v1/church/inactivate/{churchcode}:
 *  delete:
 *      tags:
 *      - "church"
 *      summary: Inactivate a church
 *      description: Endpoint to inactivate a church
 *      parameters:
 *          -   in: "path"
 *              name: "churchcode"
 *              description: "Church Code"
 *              required: true
 *              type: "string"
 *      responses:
 *          '200':
 *              description: Successfully inactivated a church
 *          '400':
 *              description: Error, invalid input
 */
router.delete('/v1/church/inactivate/:churchcode', auth, async (req, res) => {
  const churchCode = req.params.churchcode;
  try {
    const church = await Church.isChurchAdmin(churchCode, req.user.email);
    if (!church) {
      throw new Error('Only church admin able to perform this operation');
    }
    if (church.status === 0) {
      throw new Error('Church is already inactive');
    }

    church.status = 0;
    await church.save();

    res.status(200).send();
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
 *          '400':
 *              description: Error, invalid input
 */
router.post('/v1/church/servants/:churchcode', auth, async (req, res) => {
  const churchCode = req.params.churchcode;

  try {
    const church = await Church.isChurchAdminAndAvailable(
      churchCode,
      req.user.email
    );
    if (!church) {
      throw new Error(
        'Only church admin able to perform this operation or church must be active'
      );
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

    res.status(200).send();
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
 *          '400':
 *              description: Error, invalid input
 */
router.patch('/v1/church/servants/:churchcode', auth, async (req, res) => {
  const churchCode = req.params.churchcode;

  try {
    const church = await Church.isChurchAdminAndAvailable(
      churchCode,
      req.user.email
    );
    if (!church) {
      throw new Error(
        'Only church admin able to perform this operation or church must be active'
      );
    }

    const doesExist = church.servants.filter((o) => o.email === req.body.email);

    if (!doesExist || doesExist.length === 0) {
      throw new Error('Servant does not exist!');
    }

    const servantIndex = church.servants.findIndex(
      (item) => item.email === req.body.email
    );

    if (church.servants[servantIndex].status === 0) {
      throw new Error('Unable to update church servant');
    }

    church.servants[servantIndex].name = req.body.name;
    church.servants[servantIndex].role = req.body.role;

    await church.save();

    res.status(200).send();
  } catch (e) {
    logging.routerErrorLog(req, e.toString());
    res.status(400).send();
  }
});

/**
 * @swagger
 * /v1/church/servants/reactivate/{churchcode}:
 *  patch:
 *      tags:
 *      - "servants"
 *      summary: Reactivate a church servant
 *      description: Endpoint to reactivate a church servant
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
 *                      email:
 *                          type: "string"
 *                          format: "email"
 *                          example: "john@gmaail.com"
 *      responses:
 *          '200':
 *              description: Successfully reactivated a church servant
 *          '400':
 *              description: Error, invalid input
 */
router.patch(
  '/v1/church/servants/reactivate/:churchcode',
  auth,
  async (req, res) => {
    const churchCode = req.params.churchcode;

    try {
      const church = await Church.isChurchAdminAndAvailable(
        churchCode,
        req.user.email
      );
      if (!church) {
        throw new Error(
          'Only church admin able to perform this operation or church must be active'
        );
      }

      const doesExist = church.servants.filter(
        (o) => o.email === req.body.email
      );

      if (!doesExist || doesExist.length === 0) {
        throw new Error('Servant does not exist!');
      }

      const servantIndex = church.servants.findIndex(
        (item) => item.email === req.body.email
      );

      if (church.servants[servantIndex].status === 1) {
        throw new Error('Church servant is already active');
      }

      church.servants[servantIndex].status = 1;
      await church.save();

      res.status(200).send();
    } catch (e) {
      logging.routerErrorLog(req, e.toString());
      res.status(400).send();
    }
  }
);

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
    const church = await Church.isChurchAdminAndAvailable(
      churchCode,
      req.user.email
    );
    if (!church) {
      throw new Error(
        'Only church admin able to perform this operation or church must be active'
      );
    }

    const doesExist = church.servants.filter((o) => o.email === req.body.email);

    if (!doesExist || doesExist.length === 0) {
      throw new Error('Servant does not exist!');
    }

    const servantIndex = church.servants.findIndex(
      (item) => item.email === req.body.email
    );

    if (church.servants[servantIndex].status === 0) {
      throw new Error('Church servant is already inactive');
    }

    church.servants[servantIndex].status = 0;
    await church.save();

    res.status(200).send();
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
    const church = await Church.isChurchAdminAndAvailable(
      churchCode,
      req.user.email
    );
    if (!church) {
      throw new Error(
        'Only church admin able to perform this operation or church must be active'
      );
    }
    res.status(200).send({
      churchCode,
      servants: church.servants.filter((item) => item.status === 1),
    });
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
 *          '400':
 *              description: Error, invalid input
 */
router.post('/v1/church/locations/:churchcode', auth, async (req, res) => {
  const churchCode = req.params.churchcode;

  try {
    const church = await Church.isChurchAdminAndAvailable(
      churchCode,
      req.user.email
    );
    if (!church) {
      throw new Error(
        'Only church admin able to perform this operation or church must be active'
      );
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

    res.status(200).send();
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
 *          '400':
 *              description: Error, invalid input
 */
router.patch('/v1/church/locations/:churchcode', auth, async (req, res) => {
  const churchCode = req.params.churchcode;

  try {
    const church = await Church.isChurchAdminAndAvailable(
      churchCode,
      req.user.email
    );
    if (!church) {
      throw new Error(
        'Only church admin able to perform this operation or church must be active'
      );
    }

    const doesExist = church.locations.filter((o) => o.code === req.body.code);

    if (!doesExist || doesExist.length === 0) {
      throw new Error('Location code does not exist!');
    }

    const locationIndex = church.locations.findIndex(
      (item) => item.code === req.body.code
    );

    if (church.locations[locationIndex].status === 0) {
      throw new Error('Unable to update church location');
    }
    church.locations[locationIndex].location = req.body.location;
    await church.save();

    res.status(200).send();
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
 *          '400':
 *              description: Error, invalid input
 */
router.delete('/v1/church/locations/:churchcode', auth, async (req, res) => {
  const churchCode = req.params.churchcode;

  try {
    const church = await Church.isChurchAdminAndAvailable(
      churchCode,
      req.user.email
    );
    if (!church) {
      throw new Error(
        'Only church admin able to perform this operation or church must be active'
      );
    }

    const doesExist = church.locations.filter((o) => o.code === req.body.code);

    if (!doesExist || doesExist.length === 0) {
      throw new Error('Location does not exist!');
    }

    const locationIndex = church.locations.findIndex(
      (item) => item.code === req.body.code
    );

    if (church.locations[locationIndex].status === 0) {
      throw new Error('Location is already inactive');
    }

    church.locations[locationIndex].status = 0;
    await church.save();

    res.status(200).send();
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
    const church = await Church.isChurchAdminAndAvailable(
      churchCode,
      req.user.email
    );
    if (!church) {
      throw new Error(
        'Only church admin able to perform this operation or church must be active'
      );
    }

    res.status(200).send({
      churchCode,
      locations: church.locations.filter((item) => item.status === 1),
    });
  } catch (e) {
    logging.routerErrorLog(req, e.toString());
    res.status(400).send();
  }
});

/**
 * @swagger
 * /v1/church/locations/reactivate/{churchcode}:
 *  patch:
 *      tags:
 *      - "locations"
 *      summary: Reactivate a church location
 *      description: Endpoint to reactivate a church location
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
 *              description: Successfully reactivated a church servant
 *          '400':
 *              description: Error, invalid input
 */
router.patch(
  '/v1/church/locations/reactivate/:churchcode',
  auth,
  async (req, res) => {
    const churchCode = req.params.churchcode;

    try {
      const church = await Church.isChurchAdminAndAvailable(
        churchCode,
        req.user.email
      );
      if (!church) {
        throw new Error(
          'Only church admin able to perform this operation or church must be active'
        );
      }

      const doesExist = church.locations.filter(
        (o) => o.code === req.body.code
      );

      if (!doesExist || doesExist.length === 0) {
        throw new Error('Location code does not exist!');
      }

      const locationIndex = church.locations.findIndex(
        (item) => item.code === req.body.code
      );
      if (church.locations[locationIndex].status === 1) {
        throw new Error('Church location is already active');
      }
      church.locations[locationIndex].status = 1;
      await church.save();

      res.status(200).send();
    } catch (e) {
      logging.routerErrorLog(req, e.toString());
      res.status(400).send();
    }
  }
);

/**
 * @swagger
 * /v1/church/admins/{churchcode}:
 *  post:
 *      tags:
 *      - "administrator"
 *      summary: Add new church administrator
 *      description: Endpoint to add new church administrator
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
 *                  -   "adminemail"
 *                  properties:
 *                      adminemail:
 *                          type: "string"
 *                          example: "john@gmaail.com"
 *      responses:
 *          '200':
 *              description: Successfully added new church admin
 *          '400':
 *              description: Error, invalid input
 */
router.post('/v1/church/admins/:churchcode', auth, async (req, res) => {
  const churchCode = req.params.churchcode;

  try {
    const church = await Church.isChurchAdminAndAvailable(
      churchCode,
      req.user.email
    );
    if (!church) {
      throw new Error(
        'Only church admin able to perform this operation or church must be active'
      );
    }

    const isDuplicate = church.admins.filter(
      (o) => o.admin === req.body.adminemail
    );

    if (isDuplicate && isDuplicate.length > 0) {
      throw new Error('Church admin already exist!');
    }

    church.admins = church.admins.concat({
      admin: req.body.adminemail,
    });

    await church.save();

    res.status(200).send();
  } catch (e) {
    logging.routerErrorLog(req, e.toString());
    res.status(400).send();
  }
});

/**
 * @swagger
 * /v1/church/admins/{churchcode}:
 *  delete:
 *      tags:
 *      - "administrator"
 *      summary: Remove church admin
 *      description: Endpoint to remove church admin
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
 *                  -   "adminemail"
 *                  properties:
 *                      adminemail:
 *                          type: "string"
 *                          example: "john@gmaail.com"
 *      responses:
 *          '200':
 *              description: Successfully removed church admin
 *          '400':
 *              description: Error, invalid input
 */
router.delete('/v1/church/admins/:churchcode', auth, async (req, res) => {
  const churchCode = req.params.churchcode;

  try {
    const church = await Church.isChurchAdminAndAvailable(
      churchCode,
      req.user.email
    );
    if (!church) {
      throw new Error(
        'Only church admin able to perform this operation or church must be active'
      );
    }

    if (!req.body.adminemail) {
      throw new Error('Admin email is not provided');
    }

    const doesExist = church.admins.filter(
      (o) => o.admin === req.body.adminemail
    );

    console.log(req.body.adminemail, doesExist);

    if (!doesExist || doesExist.length === 0) {
      throw new Error('Church admin does not exist!');
    }

    church.admins = church.admins.filter(
      (e) => e.admin !== req.body.adminemail
    );

    await church.save();

    res.status(200).send();
  } catch (e) {
    logging.routerErrorLog(req, e.toString());
    res.status(400).send();
  }
});

/**
 * @swagger
 * /v1/church/admins/{churchcode}:
 *  get:
 *      tags:
 *      - "administrator"
 *      summary: List of church administrators
 *      description: Endpoint to list of church administrator
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
 *                  type: "array"
 *                  items:
 *                      type: "string"
 *                      example: "john@gmaail.com"
 *          '400':
 *              description: Error, invalid input
 */
router.get('/v1/church/admins/:churchcode', auth, async (req, res) => {
  const churchCode = req.params.churchcode;
  try {
    const church = await Church.isChurchAdminAndAvailable(
      churchCode,
      req.user.email
    );
    if (!church) {
      throw new Error(
        'Only church admin able to perform this operation or church must be active'
      );
    }

    let admins = [];

    church.admins.map((e) => admins.push(e.admin));

    res.status(200).send(admins);
  } catch (e) {
    logging.routerErrorLog(req, e.toString());
    res.status(400).send();
  }
});

module.exports = router;
