const moviesRouter = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { isURL } = require('validator');
const { getMovies, postMovie, deleteMovieById } = require('../controllers/movies');
const ValidationError = require('../errors/validation-error');

moviesRouter.get('/', getMovies); // получаем сохраненные фильмы

moviesRouter.post('/', celebrate({ // создаем фильм
  body: Joi.object().keys({
    country: Joi.string().required(),
    director: Joi.string().required(),
    duration: Joi.number().required(),
    year: Joi.number().required(),
    description: Joi.string().required(),
    image: Joi.required().custom((v) => {
      if (!isURL(v, { require_protocol: true })) {
        throw new ValidationError('Неверная ссылка на картинку');
      }

      return v;
    }, 'custom image link validation'),
    trailer: Joi.required().custom((v) => {
      if (!isURL(v, { require_protocol: true })) {
        throw new ValidationError('Неверная ссылка на постер к фильму');
      }

      return v;
    }, 'custom image link validation'),
    thumbnail: Joi.required().custom((v) => {
      if (!isURL(v, { require_protocol: true })) {
        throw new ValidationError('Неверная ссылка на миниатюрную картинку постера');
      }

      return v;
    }),
    movieId: Joi.string().required(),
    nameRU: Joi.string().required(),
    nameEN: Joi.string().required(),
  }),
}), postMovie);

moviesRouter.delete('/movieId', celebrate({ // удаляем фильм
  params: Joi.object().keys({
    movieId: Joi.string().required().hex(),
  }),
}), deleteMovieById);

module.exports = moviesRouter;
