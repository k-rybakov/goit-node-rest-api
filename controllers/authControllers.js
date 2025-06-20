import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import gravatar from "gravatar";
import User from "../models/User.js";
import HttpError from "../helpers/HttpError.js";
import { registerSchema, loginSchema } from "../schemas/authSchemas.js";
import fs from "fs/promises";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { JWT_SECRET } = process.env;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
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
      throw HttpError(409, "Email in use");
    }

    const avatarURL = gravatar.url(email, {
      s: "200", // Size
      r: "pg", // Rating
      d: "mm", // Default image
    });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      password: hashedPassword,
      avatarURL: avatarURL,
    });

    res.status(201).json({
      user: {
        email: user.email,
        subscription: user.subscription,
        avatarURL: user.avatarURL,
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
      throw HttpError(401, "Email or password is wrong");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw HttpError(401, "Email or password is wrong");
    }

    if (!JWT_SECRET) {
      throw HttpError(500, "JWT_SECRET is not configured");
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "24h" });
    user.token = token;
    await user.save();

    res.json({
      token,
      user: {
        email: user.email,
        subscription: user.subscription,
        avatarURL: user.avatarURL,
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
      throw HttpError(401, "Not authorized");
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
      throw HttpError(401, "Not authorized");
    }

    res.json({
      email: user.email,
      subscription: user.subscription,
      avatarURL: user.avatarURL,
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    const { id } = req.user;

    if (!req.file) {
      throw HttpError(400, "No file uploaded");
    }

    const user = await User.findByPk(id);
    if (!user) {
      throw HttpError(401, "Not authorized");
    }

    // Ensure avatars directory exists
    const avatarsDir = path.join(__dirname, "../public/avatars");
    try {
      await fs.access(avatarsDir);
    } catch (error) {
      await fs.mkdir(avatarsDir, { recursive: true });
    }

    // Delete old avatar if it's a local file (not Gravatar)
    if (user.avatarURL && user.avatarURL.startsWith("/avatars/")) {
      const oldAvatarPath = path.join(__dirname, "../public", user.avatarURL);
      try {
        await fs.unlink(oldAvatarPath);
      } catch (error) {
        // Ignore error if file doesn't exist
        console.log("Old avatar file not found:", error.message);
      }
    }

    // Move file from temp to public/avatars
    const tempPath = req.file.path;
    const filename = req.file.filename;
    const finalPath = path.join(avatarsDir, filename);

    await fs.rename(tempPath, finalPath);

    // Update user's avatarURL
    const avatarURL = `/avatars/${filename}`;
    user.avatarURL = avatarURL;
    await user.save();

    res.json({
      avatarURL: avatarURL,
    });
  } catch (error) {
    // Clean up uploaded file if error occurs
    if (req.file && req.file.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.log("Failed to clean up uploaded file:", unlinkError.message);
      }
    }
    res.status(error.status || 500).json({ message: error.message });
  }
};
