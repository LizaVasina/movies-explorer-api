require('dotenv').config();

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

const { NODE_ENV, JWT_SECRET } = process.env;

// errors
const CastError = require('../errors/cast-error');
const NotFoundError = require('../errors/not-found');
const InvalidTokenError = require('../errors/invalid-token');
const ValidationError = require('../errors/validation-error');
const UniqueValueError = require('../errors/unique-value-error');

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret-key', { expiresIn: '7d' });

      return res
        .cookie('jwt', token, {
          maxAge: 3600000,
          httpOnly: true,
          sameSite: true,
        })
        .status(200).send({ userToken: token });
    })
    .catch(() => {
      next(new InvalidTokenError('Неправильная почта или пароль'));
    });
};

module.exports.logout = (req, res) => {
  res.clearCookie('jwt').status(200).send({ message: 'Пользователь успешно деавторизован' });
};

module.exports.getUser = (req, res, next) => { // получаем информацию о текущем пользователе
  const id = req.user._id;

  User.findById(id)
    .orFail(new NotFoundError('Ресурс не найден'))
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new CastError('Переданы некорректные данные при поиске пользователя'));
      }

      next(err);
    });
};

module.exports.updateUserInfo = (req, res, next) => { // обновляем данные текущего пользователя
  const { name, email } = req.body;
  const id = req.user._id;

  User.find({ email })
    .then((data) => {
      if (data.length !== 0) { // проверка, что такого имейла нет в базе
        next(new UniqueValueError('Пользователь с такой почтой уже существует'));
      }

      User.findByIdAndUpdate(id, { name, email }, {
        runValidators: true,
        new: true,
      })
        .orFail(new NotFoundError('Ресурс не найден'))
        .then((user) => res.send(user))
        .catch((err) => {
          if (err.name === 'ValidationError') {
            next(new ValidationError('Переданы некорректные данные при обновлении пользователя'));
          }

          next(err);
        });
    })
    .catch(next);
};

module.exports.createUser = (req, res, next) => {
  const { name, email, password } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => {
      const user = User.create({
        name,
        email,
        password: hash,
      });

      return user;
    })
    .then((user) => {
      res.send({
        _id: user._id,
        name: user.name,
        email: user.email,
      });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new ValidationError('Переданы некорректные данные при создании пользователя'));
      }

      if (err.name === 'MongoError' && err.code === 11000) {
        next(new UniqueValueError('Пользователь с такой почтой уже существует'));
      }

      next(err);
    });
};
