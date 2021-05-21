"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuth = void 0;
exports.isAuth = (req, res, next) => {
    var _a;
    console.log(" I m in auth");
    // console.log(req.session?.isloggedIn);
    if (!((_a = req.session) === null || _a === void 0 ? void 0 : _a.isLoggedIn)) {
        console.log("req.session", req.session);
        return res.redirect("/login");
    }
    next();
};
