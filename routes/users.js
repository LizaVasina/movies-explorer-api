const usersRouter = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const { getUser, updateUserInfo } = require('../controllers/users');

usersRouter.get('/me', getUser); // получаем текущего пользователя

usersRouter.patch('/me', celebrate({ // обновляем информацию о пользователе
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    email: Joi.string().email(),
  }),
}), updateUserInfo);

module.exports = usersRouter;
