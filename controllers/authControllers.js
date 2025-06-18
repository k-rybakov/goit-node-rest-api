import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import HttpError from '../helpers/HttpError.js';
import { registerSchema, loginSchema } from '../schemas/authSchemas.js';
import dotenv from 'dotenv';

dotenv.config();

const { JWT_SECRET } = process.env;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

export const register = async (req, res) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) {
      throw HttpError(400, error.message);
    }

    const { email, password } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw HttpError(409, 'Email in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      user: {
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) {
      throw HttpError(400, error.message);
    }

    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw HttpError(401, 'Email or password is wrong');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw HttpError(401, 'Email or password is wrong');
    }

    if (!JWT_SECRET) {
      throw HttpError(500, 'JWT_SECRET is not configured');
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '24h' });
    user.token = token;
    await user.save();

    res.json({
      token,
      user: {
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    const { id } = req.user;
    const user = await User.findByPk(id);
    
    if (!user) {
      throw HttpError(401, 'Not authorized');
    }

    user.token = null;
    await user.save();

    res.status(204).send();
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const getCurrent = async (req, res) => {
  try {
    const { id } = req.user;
    const user = await User.findByPk(id);

    if (!user) {
      throw HttpError(401, 'Not authorized');
    }

    res.json({
      email: user.email,
      subscription: user.subscription,
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
}; 