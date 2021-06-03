import path from "path";
import multer, { FileFilterCallback } from "multer";
import { Request } from "express";
import { randomBytes } from "crypto";
import fs from "fs";

const logPath = path.join(__dirname, "logs", "morgan.log");

export const morganLogStream = fs.createWriteStream(logPath, {
  flags: "a", // new data will be appended
});

const mainFile = path.dirname(require!.main!.filename);
console.log("mainFile", mainFile);

const imagesPath = path.join(mainFile, "images");
// we are specifying multer to use the diskStorage instead of the memoryStorage because using memoryStorage slows down app.
export const fileStorage = multer.diskStorage({
  // destination: (req: Request, file: Express.Multer.File, cb) => {
  //   // if I add absolute path for "images", it would be stored in db as absolute, so when I retrieve the path for the <img src=""/> src would not accept because it requires "/images/
  //   // cb(null, path.join(__dirname, "public", "images"));
  //   cb(null, "images");

  //   // cb(null, "./images");
  // },
  destination: "images",
  filename: (req, file, cb) => {
    cb(null, randomBytes(4).toString("hex") + "-" + file.originalname);
  },
});

const ALLOWED_FORMAT = ["image/png", "image/jpg", "image/jpeg"];
export const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (ALLOWED_FORMAT.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
