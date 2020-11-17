import { Request, Response, NextFunction } from "express";

export const isAuth = (req: Request, res: Response, next: NextFunction) => {
  if (req.session && !req.session.isLoggedIn) {
    return res.redirect("/login");
  }
  next();
};
