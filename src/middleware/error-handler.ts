import { Request, Response, NextFunction } from "express";
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("erorr in middleware", error);
  res.status(500).render("500", {
    pageTitle: "Error!",
    path: "/500",
    isAuthenticated: (req.session && req.session.isLoggedIn) || false,
    errorMessage: JSON.stringify(error),
  });
  // console.log("request", req);
  next();
};
