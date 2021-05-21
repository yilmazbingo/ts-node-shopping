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
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuthroized = void 0;
const models_1 = require("../database/models");
exports.isAuthroized = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // throw new Error('Sync Dummy');
    if (req.session && !req.session.user) {
        return next();
    }
    try {
        if (req.session) {
            const user = (yield models_1.User.findById(req.session.user._id));
            if (!user) {
                return next();
            }
            req.user = user;
            next();
        }
    }
    catch (e) {
        console.log("error", e);
        next(new Error(e));
    }
});
