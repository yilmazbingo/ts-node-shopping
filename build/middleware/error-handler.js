"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
exports.errorHandler = (error, req, res, next) => {
    if (req.session) {
        res.status(500).render("500", {
            pageTitle: "Error!",
            path: "/500",
            isAuthenticated: req.session.isLoggedIn,
        });
    }
};
