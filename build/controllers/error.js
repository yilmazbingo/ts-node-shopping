"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.get500 = exports.get404 = void 0;
exports.get404 = (req, res, next) => {
    if (!req.session) {
        return;
    }
    res.status(404).render("404", {
        pageTitle: "Page Not Found",
        path: "/404",
        isAuthenticated: req.session.isLoggedIn,
    });
};
exports.get500 = (req, res, next) => {
    if (!req.session) {
        return;
    }
    res.status(500).render("500", {
        pageTitle: "Error!",
        path: "/500",
        isAuthenticated: req.session.isLoggedIn,
    });
};
