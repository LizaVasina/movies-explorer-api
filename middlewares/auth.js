const jwt = require('jsonwebtoken');
const InvalidTokenError = require('../errors/invalid-token');

module.exports = (req, res, next) => {
  const { cookie } = req.headers;

  if (!cookie || !cookie.startsWith('jwt=')) {
    next(new InvalidTokenError('Неверный токен, необходима авторизация'));
  }

  const token = cookie.replace('jwt=', '');

  let payload;

  try {
    payload = jwt.verify(token, 'dev-secret-key');
  } catch (err) {
    next(new InvalidTokenError('Неверный токен, необходима авторизация'));
  }

  req.user = payload;

  next();
};
