import { Request, Response, NextFunction } from "express";

export const isAuth = (req: Request, res: Response, next: NextFunction) => {
  console.log(" I m in auth");
  // console.log(req.session?.isloggedIn);
  if (!req.session?.isLoggedIn) {
    console.log("req.session", req.session);
    return res.redirect("/login");
  }
  next();
};
