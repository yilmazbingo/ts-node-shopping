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
exports.app = void 0;
const path_1 = __importDefault(require("path"));
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const express_session_1 = __importDefault(require("express-session"));
const connect_mongodb_session_1 = __importDefault(require("connect-mongodb-session"));
const csurf_1 = __importDefault(require("csurf"));
const morgan_1 = __importDefault(require("morgan"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const connect_flash_1 = __importDefault(require("connect-flash"));
const serve_favicon_1 = __importDefault(require("serve-favicon"));
const compression_1 = __importDefault(require("compression"));
// import multer from "multer";
const middleware_1 = require("./middleware");
const constants_1 = require("./constants");
const errorController = __importStar(require("./controllers/error"));
const admin_1 = require("./routes/admin");
const shop_1 = require("./routes/shop");
const auth_1 = require("./routes/auth");
const multer_1 = __importDefault(require("multer"));
const app = express_1.default();
exports.app = app;
const MongoDBSessionStore = connect_mongodb_session_1.default(express_session_1.default);
const store = new MongoDBSessionStore({
    uri: process.env.MONGODB_URI,
    collection: "sessions",
});
app.set("view engine", "ejs");
app.set("views", path_1.default.join(__dirname, "views"));
app.use(serve_favicon_1.default(path_1.default.join(__dirname, "public", "favicon.ico")));
app.use(cors_1.default());
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use(multer_1.default({ storage: constants_1.fileStorage, fileFilter: constants_1.fileFilter }).single("image")); //arrray for multiple
app.use(helmet_1.default());
app.use(compression_1.default()); //exludes images, assets<1kb, heroku does not compress
app.use(express_1.default.static(path_1.default.join(__dirname, "public")));
app.use("/images", express_1.default.static(path_1.default.join(__dirname, "images")));
app.use(express_session_1.default({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
}));
app.use(csurf_1.default());
app.use(connect_flash_1.default());
app.use(middleware_1.isAuthroized);
app.use((req, res, next) => {
    if (req.session) {
        res.locals.isAuthenticated = req.session.isLoggedIn;
        res.locals.csrfToken = req.csrfToken();
    }
    next();
});
app.use("/admin", admin_1.adminRoutes);
app.use(shop_1.shopRoutes);
app.use(auth_1.authRoutes);
app.get("/500", errorController.get500);
app.use(errorController.get404);
app.use(middleware_1.errorHandler);
app.use(morgan_1.default("combined", { stream: constants_1.morganLogStream }));
app.listen(process.env.PORT, () => {
    console.log(`express-authentication ${process.env.PORT}`);
});
