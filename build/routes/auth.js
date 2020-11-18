"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const authController = __importStar(require("../controllers/auth"));
const models_1 = require("../database/models");
const router = express_1.default.Router();
exports.authRoutes = router;
router.get("/login", authController.getLogin);
router.get("/signup", authController.getSignup);
router.post("/login", [
    express_validator_1.body("email")
        .isEmail()
        .withMessage("Please enter a valid email address.")
        .normalizeEmail(),
    express_validator_1.body("password", "Password has to be valid.")
        .isLength({ min: 5 })
        .isAlphanumeric()
        .trim(),
], authController.postLogin);
router.post("/signup", [
    express_validator_1.check("email")
        .isEmail()
        .withMessage("Please enter a valid email.")
        .custom((value, { req }) => {
        // if (value === 'test@test.com') {
        //   throw new Error('This email address if forbidden.');
        // }
        // return true;
        return models_1.User.findOne({ email: value }).then((userDoc) => {
            if (userDoc) {
                return Promise.reject("E-Mail exists already, please pick a different one.");
            }
        });
    })
        .normalizeEmail(),
    express_validator_1.body("password", "Please enter a password with only numbers and text and at least 5 characters.")
        .isLength({ min: 5 })
        .isAlphanumeric()
        .trim(),
    express_validator_1.body("confirmPassword")
        .trim()
        .custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error("Passwords have to match!");
        }
        return true;
    }),
], authController.postSignup);
router.post("/logout", authController.postLogout);
router.get("/reset", authController.getReset);
router.post("/reset", authController.postReset);
router.get("/reset/:token", authController.getNewPassword);
router.post("/new-password", authController.postNewPassword);
