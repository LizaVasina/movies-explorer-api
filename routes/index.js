const Router = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const usersRouter = require('./users');
const moviesRouter = require('./movies');

const NotFoundError = require('../errors/not-found');

const { createUser, login, logout } = require('../controllers/users');
const auth = require('../middlewares/auth');

Router.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
}), createUser);

Router.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
}), login);

Router.delete('/signout', logout);

Router.use('/users', auth, usersRouter);
Router.use('/movies', auth, moviesRouter);

Router.use('*', (req, res, next) => {
  next(new NotFoundError('Ресурс не найден'));
});

module.exports = Router;
