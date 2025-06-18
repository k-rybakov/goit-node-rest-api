import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import HttpError from '../helpers/HttpError.js';

const { JWT_SECRET } = process.env;

export const authenticate = async (req, res, next) => {
  try {
    const { authorization = '' } = req.headers;
    const [bearer, token] = authorization.split(' ');

    if (bearer !== 'Bearer' || !token) {
      throw HttpError(401, 'Not authorized');
    }

    const { id } = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(id);

    if (!user) {
      throw HttpError(401, 'Not authorized');
    }

    if (user.token !== token) {
      throw HttpError(401, 'Not authorized');
    }

    req.user = {
      id: user.id,
      email: user.email,
      subscription: user.subscription
    };
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      next(HttpError(401, 'Not authorized'));
    }
    next(error);
  }
}; 