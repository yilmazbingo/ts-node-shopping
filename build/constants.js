"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileFilter = exports.memoryStorage = exports.fileStorage = exports.morganLogStream = void 0;
const path_1 = __importDefault(require("path"));
const multer_1 = __importDefault(require("multer"));
const crypto_1 = require("crypto");
const fs_1 = __importDefault(require("fs"));
const logPath = path_1.default.join(__dirname, "logs", "morgan.log");
exports.morganLogStream = fs_1.default.createWriteStream(logPath, {
    flags: "a",
});
const mainFile = path_1.default.dirname(require.main.filename);
// console.log("mainFile", mainFile);
const imagesPath = path_1.default.join(mainFile, "images");
// we are specifying multer to use the diskStorage instead of the memoryStorage because using memoryStorage slows down app.
exports.fileStorage = multer_1.default.diskStorage({
    // destination: (req: Request, file: Express.Multer.File, cb) => {
    //   // if I add absolute path for "images", it would be stored in db as absolute, so when I retrieve the path for the <img src=""/> src would not accept because it requires "/images/
    //   // cb(null, path.join(__dirname, "public", "images"));
    //   cb(null, "images");
    //   // cb(null, "./images");
    // },
    destination: "images",
    filename: (req, file, cb) => {
        cb(null, crypto_1.randomBytes(4).toString("hex") + "-" + file.originalname);
    },
});
//  since I am storing cloudinary i need to get buffer and convert the buffer to base64
exports.memoryStorage = multer_1.default.memoryStorage();
const ALLOWED_FORMAT = ["image/png", "image/jpg", "image/jpeg"];
exports.fileFilter = (req, file, cb) => {
    if (ALLOWED_FORMAT.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(null, false);
    }
};
