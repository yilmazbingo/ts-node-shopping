import { Request, Response, NextFunction } from "express";
import { User, UserDoc } from "../database/models";

export const isAuthroized = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // throw new Error('Sync Dummy');
  if (!req?.session?.user) {
    return next();
  }
  try {
    if (req.session) {
      const user = (await User.findById(req.session.user._id)) as UserDoc;
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    }
  } catch (e) {
    console.log("error", e);
    next(new Error(e));
  }
};
