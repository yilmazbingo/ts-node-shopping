import { Request, Response, NextFunction } from "express";

export const get404 = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session) {
    return;
  }
  res.status(404).render("404", {
    pageTitle: "Page Not Found",
    path: "/404",
    isAuthenticated: req.session.isLoggedIn,
  });
};

export const get500 = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session) {
    return;
  }
  res.status(500).render("500", {
    pageTitle: "Error!",
    path: "/500",
    isAuthenticated: req.session.isLoggedIn,
  });
};
