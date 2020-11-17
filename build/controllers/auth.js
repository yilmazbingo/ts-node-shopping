"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postNewPassword = exports.getNewPassword = exports.postReset = exports.getReset = exports.postLogout = exports.postSignup = exports.postLogin = exports.getSignup = exports.getLogin = void 0;
const crypto_1 = __importDefault(require("crypto"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const nodemailer_sendgrid_transport_1 = __importDefault(require("nodemailer-sendgrid-transport"));
const express_validator_1 = require("express-validator");
const errors_1 = require("../errors");
const user_1 = require("../database/models/user");
const transporter = nodemailer_1.default.createTransport(nodemailer_sendgrid_transport_1.default({
    auth: {
        api_key: "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",
    },
}));
exports.getLogin = (req, res, next) => {
    let message = req.flash("error");
    if (message.length > 0) {
        message = message[0];
    }
    else {
        message = null;
    }
    res.render("auth/login", {
        path: "/login",
        pageTitle: "Login",
        errorMessage: message,
        oldInput: {
            email: "",
            password: "",
        },
        validationErrors: [],
    });
};
exports.getSignup = (req, res, next) => {
    let message = req.flash("error");
    if (message.length > 0) {
        message = message[0];
    }
    else {
        message = null;
    }
    res.render("auth/signup", {
        path: "/signup",
        pageTitle: "Signup",
        errorMessage: message,
        oldInput: {
            email: "",
            password: "",
            confirmPassword: "",
        },
        validationErrors: [],
    });
};
exports.postLogin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.body.email;
    const password = req.body.password;
    const errors = express_validator_1.validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render("auth/login", {
            path: "/login",
            pageTitle: "Login",
            errorMessage: errors.array()[0].msg,
            oldInput: {
                email: email,
                password: password,
            },
            validationErrors: errors.array(),
        });
    }
    try {
        const user = yield user_1.User.findOne({ email });
        if (!user) {
            return res.status(422).render("auth/login", {
                path: "/login",
                pageTitle: "Login",
                errorMessage: "Invalid email or password.",
                oldInput: {
                    email: email,
                    password: password,
                },
                validationErrors: [],
            });
        }
        const doMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (req.session && doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save((err) => {
                console.log(err);
                res.redirect("/");
            });
        }
        return res.status(422).render("auth/login", {
            path: "/login",
            pageTitle: "Login",
            errorMessage: "Invalid email or password.",
            oldInput: {
                email: email,
                password: password,
            },
            validationErrors: [],
        });
    }
    catch (e) {
        res.redirect("/login");
    }
});
exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const errors = express_validator_1.validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors.array());
        return res.status(422).render("auth/signup", {
            path: "/signup",
            pageTitle: "Signup",
            errorMessage: errors.array()[0].msg,
            oldInput: {
                email: email,
                password: password,
                confirmPassword: req.body.confirmPassword,
            },
            validationErrors: errors.array(),
        });
    }
    bcryptjs_1.default
        .hash(password, 12)
        .then((hashedPassword) => {
        const user = new user_1.User({
            email: email,
            password: hashedPassword,
            cart: { items: [] },
        });
        return user.save();
    })
        .then((result) => {
        res.redirect("/login");
        // return transporter.sendMail({
        //   to: email,
        //   from: 'shop@node-complete.com',
        //   subject: 'Signup succeeded!',
        //   html: '<h1>You successfully signed up!</h1>'
        // });
    })
        .catch((err) => {
        throw new errors_1.InternalServerError(err.message);
    });
};
exports.postLogout = (req, res, next) => {
    if (!req.session) {
        throw new errors_1.NotAuthorizedError();
    }
    req.session.destroy((err) => {
        console.log(err);
        res.redirect("/");
    });
};
exports.getReset = (req, res, next) => {
    let message = req.flash("error");
    if (message.length > 0) {
        message = message[0];
    }
    else {
        message = null;
    }
    res.render("auth/reset", {
        path: "/reset",
        pageTitle: "Reset Password",
        errorMessage: message,
    });
};
exports.postReset = (req, res, next) => {
    crypto_1.default.randomBytes(32, (err, buffer) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            console.log(err);
            return res.redirect("/reset");
        }
        const token = buffer.toString("hex");
        try {
            const user = yield user_1.User.findOne({ email: req.body.email });
            if (!user) {
                req.flash("error", "No account with that email found.");
                return res.redirect("/reset");
            }
            user.resetToken = token;
            user.resetTokenExpiration = new Date(new Date().setTime(new Date().getTime() + 3600000));
            yield user.save();
            res.redirect("/");
            transporter.sendMail({
                to: req.body.email,
                from: "shop@node-complete.com",
                subject: "Password reset",
                html: `
        <p>You requested a password reset</p>
        <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>
      `,
            });
        }
        catch (e) {
            throw new errors_1.InternalServerError(e.message);
        }
    }));
};
exports.getNewPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.params.token;
    try {
        const user = (yield user_1.User.findOne({
            resetToken: token,
            resetTokenExpiration: { $gt: new Date() },
        }));
        let message = req.flash("error");
        if (message.length > 0) {
            message = message[0];
        }
        else {
            message = null;
        }
        res.render("auth/new-password", {
            path: "/new-password",
            pageTitle: "New Password",
            errorMessage: message,
            userId: user._id.toString(),
            passwordToken: token,
        });
    }
    catch (e) {
        throw new errors_1.InternalServerError(e.message);
    }
});
exports.postNewPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;
    let resetUser;
    try {
        // Date.now() returns integer.
        const user = yield user_1.User.findOne({
            resetToken: passwordToken,
            resetTokenExpiration: { $gt: new Date() },
            _id: userId,
        });
        if (!user) {
            throw new errors_1.NotFoundError();
        }
        resetUser = user;
        const hashedPassword = yield bcryptjs_1.default.hash(newPassword, 12);
        resetUser.password = hashedPassword;
        resetUser.resetToken = undefined;
        resetUser.resetTokenExpiration = undefined;
        res.redirect("/login");
    }
    catch (err) {
        throw new errors_1.InternalServerError(err.message);
    }
});
