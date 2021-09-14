const Movie = require('../models/movie');

// errors
const NotFoundError = require('../errors/not-found');
const NoRightsError = require('../errors/no-rights-error');
const CastError = require('../errors/cast-error');
const ValidationError = require('../errors/validation-error');

module.exports.getMovies = (req, res) => { // получаем все фильмы
  const owner = req.user._id;

  Movie.find({ owner })
    .then((movies) => res.send(movies))
    .catch((err) => { res.status(500).send({ message: err }); });
};

module.exports.postMovie = (req, res, next) => { // добавляем фильм в избранное
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
  } = req.body;
  const owner = req.user._id;

  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
    owner,
  })
    .then((movie) => res.send(movie))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new ValidationError('Переданы некорректные данные при создании фильма'));
      }

      next(err);
    });
};

module.exports.deleteMovieById = (req, res, next) => { // удаляем фильм из избранного
  Movie.findById({ _id: req.params.movieId })
    .orFail(new NotFoundError('Ресурс не найден тута'))
    .then((movie) => { // проверка на соответствие текущего пользователя и создателя фильма
      if (String(movie.owner) !== String(req.user._id)) {
        throw new Error('Cant delete');
      }

      return Movie.findByIdAndDelete(req.params.movieId)
        .orFail(new NotFoundError('Ресурс не найден тут'))
        .then(() => res.status(200).send({ message: 'Фильм успешно удален' }))
        .catch(next);
    })
    .catch((err) => {
      if (err.message === 'Cant delete') {
        next(new NoRightsError('Пользователь не может удалить этот фильм'));
      }

      if (err.name === 'CastError') {
        next(new CastError('Переданы некорректные данные для удаления фильма'));
      }

      next(err);
    });
};
