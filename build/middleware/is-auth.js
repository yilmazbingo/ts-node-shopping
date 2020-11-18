"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuth = void 0;
exports.isAuth = (req, res, next) => {
    if (req.session && !req.session.isLoggedIn) {
        return res.redirect("/login");
    }
    next();
};
