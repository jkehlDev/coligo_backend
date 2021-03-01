/**
 * @module errors This define server errors middleware management
 */
const errors = {
  error404: (_, response) => {
    response.status(404).json({ error: 'Resource not found' });
  },
  error500: (error, _, response, __) => {
    response.status(500).json({ error });
  },
};
module.exports =  errors;
