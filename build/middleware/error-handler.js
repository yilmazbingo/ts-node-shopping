"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
exports.errorHandler = (error, req, res, next) => {
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
