import fs from "fs";
import path from "path";
// const appRoot = require("app-root-path");

const logPath = path.join(__dirname, "..", "logs", "morgan.log");

export const morganLogStream = fs.createWriteStream(logPath, {
  flags: "a",
});
