"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.morganLogStream = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// const appRoot = require("app-root-path");
const logPath = path_1.default.join(__dirname, "..", "logs", "morgan.log");
exports.morganLogStream = fs_1.default.createWriteStream(logPath, {
    flags: "a",
});
