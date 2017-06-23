 /**
  * @swagger
  * definitions:
  *   SerializedJob:
  *     allOf:
  *       - $ref: '#/definitions/BaseModel'
  *       - properties:
  *          title:
  *            type: string
  *          shortDescription:
  *            type: string
  *          availability:
  *            type: string
  *          city:
  *            type: string
  *          date:
  *            type: string
  *            format: "date"
  *          link:
  *            type: string
  */
module.exports = {
  attributes: {
    title: {
      type: 'string',
    },
    shortDescription: {
      type: 'string',
    },
    availability: {
      type: 'string',
    },
    city: {
      type: 'string',
    },
    company: {
      type: 'string',
    },
    date: {
      type: 'date',
    },
    link: {
      type: 'string',
    },
  },
};
