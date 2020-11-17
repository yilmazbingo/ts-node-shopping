"use strict";
// import path from "path";
// import winston, { Logger, LoggerInstance, Transports } from "winston";
// // const appRoot = require("app-root-path");
// import MongoDB, { MongoDBTransportInstance } from "winston-mongodb";
// import { NextFunction, Request, Response } from "express";
// interface ITransports extends Transports {
//   MongoDB: MongoDBTransportInstance;
// }
// let options = {
//   file: {
//     level: "info",
//     // filename: `${appRoot}/logs/winston.log`,
//     filename: path.join(__dirname, "..", "logs", "winston.log"),
//     handleExceptions: true,
//     handleRejections: true,
//     json: true,
//     maxsize: 5242880,
//     maxFiles: 4,
//     colorize: true,
//   },
//   console: {
//     level: "debug",
//     handleExceptions: true,
//     json: false,
//     colorize: true,
//   },
//   database: {
//     db: "mongodb://localhost/bingobookstore",
//     level: "info",
//     collection: "errors",
//     handleExceptions: true,
//     json: true,
//     maxsize: 5242880,
//     maxFiles: 4,
//     colorize: true,
//   },
// };
// //If an error is thrown outside express, this middleware function cannot be called
// export const winstonLogger = function (
//   err: Error,
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) {
//   const logger =<Logger> winston.createLogger({
//     transports: [
//       winston.add(new winston.transports.File(options.file)),
//       winston.add(new winston.transports.Console(options.console)),
//       winston.add((new winston.transports.MongoDB(options.database)),
//     ],
//     exitOnError: false,
//   });
//   logger.stream = {
//     write: function (message: string, encoding: string) {
//       logger.info(message);
//     },
//   };
//   //   winston.error(res.status(500).send("something failed"), err);
//   res.status(500).send("something failed");
//   next();
// };
