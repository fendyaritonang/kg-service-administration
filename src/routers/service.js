const express = require('express');
const auth = require('../middleware/auth');
const url = require('url');
const router = new express.Router();
const logging = require('../utils/logging');
const Church = require('../models/church');
const Service = require('../models/service');
const moment = require('moment');

/**
 * @swagger
 * /v1/church/service/{churchcode}:
 *  post:
 *      tags:
 *      - "service"
 *      summary: Create new service schedule
 *      description: Endpoint to create new service schedule
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
 *                  -   "title"
 *                  -   "datetimeStart"
 *                  -   "datetimeEnd"
 *                  properties:
 *                      title:
 *                          type: "string"
 *                          example: "Minggu Trinitatis"
 *                      datetimeStart:
 *                          type: "string"
 *                          example: "1900-01-01T00:00:00Z"
 *                      datetimeEnd:
 *                          type: "string"
 *                          example: "1900-01-01T00:00:00Z"
 *                      locationCode:
 *                          type: "string"
 *                          example: "ruang_utama"
 *                      locationName:
 *                          type: "string"
 *                          example: "Ruang utama gereja lantai 1"
 *                      reflection:
 *                          type: "string"
 *                          example: "Service reflection"
 *                      remarks:
 *                          type: "string"
 *                          example: "Service remarks"
 *      responses:
 *          '201':
 *              description: Successfully created new service schedule
 *              schema:
 *                  type: "object"
 *                  properties:
 *                      title:
 *                          type: "string"
 *                          example: "Minggu Trinitatis"
 *                      datetimeStart:
 *                          type: "string"
 *                          example: "1900-01-01T00:00:00Z"
 *                      datetimeEnd:
 *                          type: "string"
 *                          example: "1900-01-01T00:00:00Z"
 *                      locationCode:
 *                          type: "string"
 *                          example: "ruang_utama"
 *                      locationName:
 *                          type: "string"
 *                          example: "Ruang utama gereja lantai 1"
 *                      reflection:
 *                          type: "string"
 *                          example: "Service reflection"
 *                      remarks:
 *                          type: "string"
 *                          example: "Service remarks"
 *          '400':
 *              description: Error, invalid input
 */
router.post('/v1/church/service/:churchcode', auth, async (req, res) => {
  const churchCode = req.params.churchcode;
  const locationCode = req.body.locationCode || 'main';
  const locationName = req.body.locationName || 'Main Hall';
  let datetimeStart = moment(req.body.datetimeStart).utc().format();
  let datetimeEnd = moment(req.body.datetimeEnd).utc().format();

  try {
    if (moment(datetimeEnd) <= moment(datetimeStart)) {
      throw new Error(
        'Service date start must be earlier than service date end'
      );
    }

    const church = await Church.isChurchAdminAndAvailable(
      churchCode,
      req.user.email
    );
    if (!church) {
      throw new Error(
        'Only church admin able to perform this operation or church must be confirmed'
      );
    }

    const isOverlapping = await Service.isOverlapping({
      churchCode,
      locationCode,
      datetimeStart,
      datetimeEnd,
    });

    if (isOverlapping) {
      throw new Error(
        'Service date is overlapping with other schedule at the selected location'
      );
    }

    const service = new Service({
      churchCode,
      locationCode,
      locationName,
      datetimeStart,
      datetimeEnd,
      title: req.body.title,
      reflection: req.body.reflection,
      remarks: req.body.remarks,
    });
    await service.save();

    res.status(201).send();
  } catch (e) {
    logging.routerErrorLog(req, e.toString());
    res.status(400).send();
  }
});

/**
 * @swagger
 * /v1/church/service/{serviceid}:
 *  patch:
 *      tags:
 *      - "service"
 *      summary: Update existing service schedule
 *      description: Endpoint to update existing service schedule
 *      parameters:
 *          -   in: "path"
 *              name: "serviceid"
 *              description: "Service Id"
 *              required: true
 *              type: "string"
 *          -   in: "body"
 *              name: "body"
 *              required: true
 *              schema:
 *                  type: "object"
 *                  required:
 *                  -   "title"
 *                  -   "datetimeStart"
 *                  -   "datetimeEnd"
 *                  -   "locationCode"
 *                  -   "locationName"
 *                  properties:
 *                      title:
 *                          type: "string"
 *                          example: "Minggu Trinitatis"
 *                      datetimeStart:
 *                          type: "string"
 *                          example: "1900-01-01T00:00:00Z"
 *                      datetimeEnd:
 *                          type: "string"
 *                          example: "1900-01-01T00:00:00Z"
 *                      locationCode:
 *                          type: "string"
 *                          example: "ruang_utama"
 *                      locationName:
 *                          type: "string"
 *                          example: "Ruang utama gereja lantai 1"
 *                      reflection:
 *                          type: "string"
 *                          example: "Service reflection"
 *                      remarks:
 *                          type: "string"
 *                          example: "Service remarks"
 *      responses:
 *          '200':
 *              description: Successfully updated service schedule
 *              schema:
 *                  type: "object"
 *                  properties:
 *                      title:
 *                          type: "string"
 *                          example: "Minggu Trinitatis"
 *                      datetimeStart:
 *                          type: "string"
 *                          example: "1900-01-01T00:00:00Z"
 *                      datetimeEnd:
 *                          type: "string"
 *                          example: "1900-01-01T00:00:00Z"
 *                      locationCode:
 *                          type: "string"
 *                          example: "ruang_utama"
 *                      locationName:
 *                          type: "string"
 *                          example: "Ruang utama gereja lantai 1"
 *                      reflection:
 *                          type: "string"
 *                          example: "Service reflection"
 *                      remarks:
 *                          type: "string"
 *                          example: "Service remarks"
 *          '400':
 *              description: Error, invalid input
 */
router.patch('/v1/church/service/:serviceid', auth, async (req, res) => {
  const serviceId = req.params.serviceid;
  const locationCode = req.body.locationCode || 'main';
  const locationName = req.body.locationName || 'Main Hall';
  let datetimeStart = moment(req.body.datetimeStart).utc().format();
  let datetimeEnd = moment(req.body.datetimeEnd).utc().format();

  try {
    if (moment(datetimeEnd) <= moment(datetimeStart)) {
      throw new Error(
        'Service date start must be earlier than service date end'
      );
    }

    const service = await Service.findOne({ _id: serviceId });
    if (!service) {
      throw new Error('Invalid service record');
    }

    const churchCode = service.churchCode;
    const church = await Church.isChurchAdminAndAvailable(
      churchCode,
      req.user.email
    );
    if (!church) {
      throw new Error(
        'Only church admin able to perform this operation or church must be confirmed'
      );
    }

    const timeOffset = church.timeOffset;
    datetimeStart = moment(datetimeStart)
      .utc(timeOffset)
      .add(-timeOffset, 'minutes')
      .utcOffset(timeOffset)
      .utc()
      .format();
    datetimeEnd = moment(datetimeEnd)
      .utc(timeOffset)
      .add(-timeOffset, 'minutes')
      .utcOffset(timeOffset)
      .utc()
      .format();

    const isOverlapping = await Service.isOverlapping({
      churchCode,
      locationCode,
      datetimeStart,
      datetimeEnd,
      serviceId,
    });

    if (isOverlapping) {
      throw new Error(
        'Service date is overlapping with other schedule at the selected location'
      );
    }

    service.locationCode = locationCode;
    service.locationName = locationName;
    service.datetimeStart = datetimeStart;
    service.datetimeEnd = datetimeEnd;
    service.title = req.body.title;
    service.reflection = req.body.reflection;
    service.remarks = req.body.remarks;
    await service.save();

    res.status(200).send();
  } catch (e) {
    logging.routerErrorLog(req, e.toString());
    res.status(400).send();
  }
});

/**
 * @swagger
 * /v1/church/service/publish/{serviceid}:
 *  patch:
 *      tags:
 *      - "service"
 *      summary: Publish service schedule
 *      description: Endpoint to publish service schedule
 *      parameters:
 *          -   in: "path"
 *              name: "serviceid"
 *              description: "Service Id"
 *              required: true
 *              type: "string"
 *      responses:
 *          '200':
 *              description: Successfully published a service schedule
 *          '400':
 *              description: Error, invalid input
 */
router.patch(
  '/v1/church/service/publish/:serviceid',
  auth,
  async (req, res) => {
    const serviceId = req.params.serviceid;

    try {
      const service = await Service.findOne({ _id: serviceId, status: 2 });
      if (!service) {
        throw new Error('Invalid service record');
      }

      const churchCode = service.churchCode;
      const church = await Church.isChurchAdminAndAvailable(
        churchCode,
        req.user.email
      );
      if (!church) {
        throw new Error(
          'Only church admin able to perform this operation or church must be confirmed'
        );
      }

      service.status = 1;
      await service.save();

      res.status(200).send();
    } catch (e) {
      logging.routerErrorLog(req, e.toString());
      res.status(400).send();
    }
  }
);

/**
 * @swagger
 * /v1/church/service/liturgy/{serviceid}:
 *  post:
 *      tags:
 *      - "service"
 *      summary: Create liturgy for a scheduled service
 *      description: Endpoint to create liturgy for a scheduled service
 *      parameters:
 *          -   in: "path"
 *              name: "serviceid"
 *              description: "Service Id"
 *              required: true
 *              type: "string"
 *          -   in: "body"
 *              name: "body"
 *              required: true
 *              schema:
 *                  type: "array"
 *                  items:
 *                    $ref: "#/definitions/Liturgy"
 *      responses:
 *          '200':
 *              description: Successfully created liturgy for scheduled service
 *              schema:
 *                  type: "array"
 *                  items:
 *                      $ref: "#/definitions/Liturgy"
 *          '400':
 *              description: Error, invalid input
 */
router.post('/v1/church/service/liturgy/:serviceid', auth, async (req, res) => {
  const serviceId = req.params.serviceid;

  try {
    const service = await Service.findOne({ _id: serviceId });
    if (!service) {
      throw new Error('Invalid service record');
    }

    const churchCode = service.churchCode;
    const church = await Church.isChurchAdminAndAvailable(
      churchCode,
      req.user.email
    );
    if (!church) {
      throw new Error(
        'Only church admin able to perform this operation or church must be confirmed'
      );
    }

    const liturgy = req.body;
    if (!liturgy || liturgy.length === 0) {
      throw new Error('Invalid data');
    }

    const invalidData = liturgy.filter(
      (item) => !item.title || (item.title && item.title === '')
    );
    if (invalidData.length > 0) {
      throw new Error('One of the record contain empty title');
    }

    let liturgyData = [];
    liturgy.map((item) => {
      liturgyData.push({
        title: item.title,
        titleLink: !item.titleLink ? '' : item.titleLink,
        content: !item.content ? '' : item.content,
        contentLink: !item.contentLink ? '' : item.contentLink,
      });
    });

    service.liturgy = liturgyData;
    await service.save();

    res.status(200).send();
  } catch (e) {
    logging.routerErrorLog(req, e.toString());
    res.status(400).send();
  }
});

/**
 * @swagger
 * /v1/church/service/news/{serviceid}:
 *  post:
 *      tags:
 *      - "service"
 *      summary: Create news for a scheduled service
 *      description: Endpoint to create news for a scheduled service
 *      parameters:
 *          -   in: "path"
 *              name: "serviceid"
 *              description: "Service Id"
 *              required: true
 *              type: "string"
 *          -   in: "body"
 *              name: "body"
 *              required: true
 *              schema:
 *                  type: "array"
 *                  items:
 *                    $ref: "#/definitions/News"
 *      responses:
 *          '200':
 *              description: Successfully created news for scheduled service
 *              schema:
 *                  type: "array"
 *                  items:
 *                      $ref: "#/definitions/News"
 *          '400':
 *              description: Error, invalid input
 */
router.post('/v1/church/service/news/:serviceid', auth, async (req, res) => {
  const serviceId = req.params.serviceid;

  try {
    const service = await Service.findOne({ _id: serviceId });
    if (!service) {
      throw new Error('Invalid service record');
    }

    const churchCode = service.churchCode;
    const church = await Church.isChurchAdminAndAvailable(
      churchCode,
      req.user.email
    );
    if (!church) {
      throw new Error(
        'Only church admin able to perform this operation or church must be confirmed'
      );
    }

    const news = req.body;
    if (!news || news.length === 0) {
      throw new Error('Invalid data');
    }

    const invalidData = news.filter(
      (item) =>
        !item.title ||
        !item.content ||
        (item.title && item.title === '') ||
        (item.content && item.content === '')
    );
    if (invalidData.length > 0) {
      throw new Error('One of the record contain empty title or content');
    }

    let newsData = [];
    news.map((item) => {
      newsData.push({
        title: item.title,
        content: !item.content ? '' : item.content,
        link: !item.link ? '' : item.link,
      });
    });

    service.news = newsData;
    await service.save();

    res.status(200).send();
  } catch (e) {
    logging.routerErrorLog(req, e.toString());
    res.status(400).send();
  }
});

/**
 * @swagger
 * /v1/church/service/servants/{serviceid}:
 *  post:
 *      tags:
 *      - "service"
 *      summary: Create servants for a scheduled service
 *      description: Endpoint to create servants for a scheduled service
 *      parameters:
 *          -   in: "path"
 *              name: "serviceid"
 *              description: "Service Id"
 *              required: true
 *              type: "string"
 *          -   in: "body"
 *              name: "body"
 *              required: true
 *              schema:
 *                  type: "array"
 *                  items:
 *                    $ref: "#/definitions/ServiceServants"
 *      responses:
 *          '200':
 *              description: Successfully created servants for scheduled service
 *              schema:
 *                  type: "array"
 *                  items:
 *                      $ref: "#/definitions/ServiceServants"
 *          '400':
 *              description: Error, invalid input
 */
router.post(
  '/v1/church/service/servants/:serviceid',
  auth,
  async (req, res) => {
    const serviceId = req.params.serviceid;

    try {
      const service = await Service.findOne({ _id: serviceId });
      if (!service) {
        throw new Error('Invalid service record');
      }

      const churchCode = service.churchCode;
      const church = await Church.isChurchAdminAndAvailable(
        churchCode,
        req.user.email
      );
      if (!church) {
        throw new Error(
          'Only church admin able to perform this operation or church must be confirmed'
        );
      }

      const servants = req.body;
      if (!servants || servants.length === 0) {
        throw new Error('Invalid data');
      }

      const invalidData = servants.filter(
        (item) =>
          !item.serviceRole ||
          !item.servantRole ||
          !item.name ||
          !item.email ||
          (item.serviceRole && item.serviceRole === '') ||
          (item.servantRole && item.servantRole === '') ||
          (item.name && item.name === '') ||
          (item.email && item.email === '')
      );
      if (invalidData.length > 0) {
        throw new Error('One of the record contain invalid data');
      }

      let servantsData = [];
      servants.map((item) => {
        servantsData.push({
          serviceRole: item.serviceRole,
          servantRole: item.servantRole,
          name: item.name,
          email: item.email,
        });
      });

      service.servants = servantsData;
      await service.save();

      res.status(200).send();
    } catch (e) {
      logging.routerErrorLog(req, e.toString());
      res.status(400).send();
    }
  }
);

/**
 * @swagger
 * /v1/church/service/events:
 *  get:
 *      tags:
 *      - "service"
 *      summary: List of published service events from search criteria
 *      description: Endpoint to list of published service events from search criteria
 *      parameters:
 *          -   name: "name"
 *              in: "query"
 *              description: "Church Name"
 *              type: "string"
 *          -   name: "serviceDateTimeFrom"
 *              in: "query"
 *              description: "Church Service Date Time (from)"
 *              type: "string"
 *              example: "1900-01-01T00:00:00Z"
 *          -   name: "serviceDateTimeTo"
 *              in: "query"
 *              description: "Church Service Date Time (to)"
 *              type: "string"
 *              example: "1900-01-01T00:00:00Z"
 *      responses:
 *          '200':
 *              description: Successfully listed all published service events from search criteria
 *              schema:
 *                  type: "object"
 *                  properties:
 *                    churches:
 *                      type: "array"
 *                      items:
 *                        $ref: "#/definitions/ChurchHeader"
 *                    services:
 *                      type: "array"
 *                      items:
 *                        $ref: "#/definitions/ServiceHeader"
 *          '400':
 *              description: Error, invalid input
 */
router.get('/v1/church/service/events', async (req, res) => {
  try {
    const queryObject = url.parse(req.url.replace(/%2C/g, '<comma>'), true)
      .query;
    let { name, serviceDateTimeFrom, serviceDateTimeTo } = {
      ...queryObject,
    };

    serviceDateTimeFrom = !serviceDateTimeFrom ? '' : serviceDateTimeFrom;
    serviceDateTimeTo = !serviceDateTimeTo ? '' : serviceDateTimeTo;

    if (
      (serviceDateTimeFrom !== '' && serviceDateTimeTo === '') ||
      (serviceDateTimeFrom === '' && serviceDateTimeTo !== '')
    ) {
      throw new Error('One of the date is empty');
    }

    if (serviceDateTimeFrom !== '' && serviceDateTimeTo !== '') {
      if (
        moment(serviceDateTimeFrom).isSameOrAfter(moment(serviceDateTimeTo))
      ) {
        throw new Error(
          'Service date from must be earlier than service date to'
        );
      }
      serviceDateTimeFrom = moment(serviceDateTimeFrom).utc().format();
      serviceDateTimeTo = moment(serviceDateTimeTo).utc().format();
    } else {
      serviceDateTimeFrom = moment().utc().format();
      serviceDateTimeTo = moment(serviceDateTimeFrom)
        .add(30, 'd')
        .utc()
        .format();
    }

    const searchDuration = moment
      .duration(moment(serviceDateTimeTo).diff(moment(serviceDateTimeFrom)))
      .asDays();
    if (searchDuration > 30) {
      throw new Error('You can only search maximum 30 days range');
    }

    let church = [];
    let searchAnd = [];
    if (name && name !== '') {
      church = await Church.find(
        {
          status: 1,
          name: {
            $regex: new RegExp(
              `.*${escape(name).replace(/\%20/g, ' ')}.*`,
              'i'
            ),
          },
        },
        'code name address timeOffset'
      );

      if (church.length > 0) {
        searchAnd.push({ churchCode: { $in: church.map((obj) => obj.code) } });
      } else {
        return res.status(200).send({ churches: [], services: [] });
      }
    }

    searchAnd.push({
      datetimeStart: { $lte: serviceDateTimeTo },
    });
    searchAnd.push({
      datetimeEnd: { $gte: serviceDateTimeFrom },
    });
    searchAnd.push({ status: 1 });

    const search = { $and: searchAnd };
    const service = await Service.find(
      search,
      'churchCode title datetimeStart datetimeEnd locationCode locationName reflection remarks'
    );

    if ((!church || church.length == 0) && service.length > 0) {
      const distinctChurhCode = [
        ...new Set(service.map((obj) => obj.churchCode)),
      ];

      church = await Church.find(
        { status: 1, code: { $in: distinctChurhCode } },
        'code name address timeOffset'
      );
    }

    if (!church || church.length == 0) {
      church = [];
      service = [];
    }

    const churchCodes = church.map((item) => item.code);

    res.status(200).send({
      churches: church,
      services: service.filter((item) => churchCodes.includes(item.churchCode)),
    });
  } catch (e) {
    logging.routerErrorLog(req, e.toString());
    res.status(400).send();
  }
});

/**
 * @swagger
 * /v1/church/service/events/{churchcode}:
 *  get:
 *      tags:
 *      - "service"
 *      summary: Display of today's published selected church event
 *      description: Endpoint to display of today's published selected church event
 *      parameters:
 *          -   in: "path"
 *              name: "churchcode"
 *              description: "Church Code"
 *              required: true
 *              type: "string"
 *      responses:
 *          '200':
 *              description: Successfully displayed of today's published selected church event
 *              schema:
 *                  type: "object"
 *                  properties:
 *                    churches:
 *                      type: "object"
 *                      properties:
 *                          _id:
 *                              type: "string"
 *                              example: "5ebe3126f2c8bd30b8525166"
 *                          code:
 *                              type: "string"
 *                              example: "hkbps"
 *                          name:
 *                              type: "string"
 *                              example: "HKBP Singapore"
 *                          address:
 *                              type: "string"
 *                              example: "8 Short Street Singapore"
 *                          timeOffset:
 *                              type: "integer"
 *                              example: "420"
 *                    services:
 *                      type: "object"
 *                      properties:
 *                          churchCode:
 *                              type: "string"
 *                              example: "hkbps"
 *                          title:
 *                              type: "string"
 *                              example: "Minggu Trinitatis"
 *                          datetimeStart:
 *                              type: "string"
 *                              example: "1900-01-01T00:00:00Z"
 *                          datetimeEnd:
 *                              type: "string"
 *                              example: "1900-01-01T00:00:00Z"
 *                          locationCode:
 *                              type: "string"
 *                              example: "ruang_utama"
 *                          locationName:
 *                              type: "string"
 *                              example: "Ruang Utama Gereja Lantai 1 (optional)"
 *                          reflection:
 *                              type: "string"
 *                              example: "Service reflection (optional)"
 *                          remarks:
 *                              type: "string"
 *                              example: "Service remarks (optional)"
 *                          liturgy:
 *                              type: "array"
 *                              items:
 *                                  $ref: "#/definitions/Liturgy"
 *                          servants:
 *                              type: "array"
 *                              items:
 *                                  $ref: "#/definitions/ServiceServants"
 *                          news:
 *                              type: "array"
 *                              items:
 *                                  $ref: "#/definitions/News"
 *          '400':
 *              description: Error, invalid input
 */
router.get('/v1/church/service/events/:churchcode', async (req, res) => {
  const churchCode = req.params.churchcode;
  try {
    const church = await Church.findOne(
      { status: 1, code: churchCode },
      'code name address timeOffset'
    );
    if (!church) {
      throw new Error('Church does not exist');
    }

    const timeOffset = church.timeOffset;
    const dateFrom = moment()
      .utcOffset(timeOffset)
      .startOf('day')
      .utc()
      .format();
    const dateTo = moment().utcOffset(timeOffset).endOf('day').utc().format();

    const service = await Service.find({
      status: 1,
      datetimeStart: { $lte: dateTo },
      datetimeEnd: { $gte: dateFrom },
    });

    res.status(200).send({ churches: church, services: service });
  } catch (e) {
    logging.routerErrorLog(req, e.toString());
    res.status(400).send();
  }
});

module.exports = router;
