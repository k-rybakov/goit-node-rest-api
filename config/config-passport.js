import { use } from "passport";
import { ExtractJwt, Strategy as _Strategy } from "passport-jwt";
import { find } from "../schemas/user";
import dotenv from "dotenv";
dotenv.config();
const secret = process.env.SECRET;

const ExtractJWT = ExtractJwt;
const Strategy = _Strategy;
const params = {
  secretOrKey: secret,
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
};

// JWT Strategy
use(
  new Strategy(params, function (payload, done) {
    find({ _id: payload.id })
      .then(([user]) => {
        if (!user) {
          return done(new Error("User not found"));
        }
        return done(null, user);
      })
      .catch((err) => done(err));
  })
);
