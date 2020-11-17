"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./database/index");
require("./app");
if (!process.env.STRIPE_SECRET_KEY && !process.env.SESSION_SECRET) {
    console.log("STRIPE_SECRET_KEY and EXPRESS  SESSION_SECRET are missing");
    process.exit(1);
}
