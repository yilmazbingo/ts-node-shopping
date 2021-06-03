import path from "path";
import express from "express";
import session from "express-session";
import MongoDBStore from "connect-mongodb-session";
import csrf from "csurf";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import flash from "connect-flash";
import favicon from "serve-favicon";
import compression from "compression";
import { errorHandler, isAuthroized } from "./middleware";
import { morganLogStream, fileFilter, fileStorage } from "./constants";
import * as errorController from "./controllers/error";
import { UserDoc } from "./database/models";
import { adminRoutes } from "./routes/admin";
import { shopRoutes } from "./routes/shop";
import { authRoutes } from "./routes/auth";
import multer from "multer";

declare global {
  namespace Express {
    interface Request {
      // currentUser might not be defined if it is not logged in
      user?: UserDoc;
      query?: { [key: string]: string };
      // session: Express.Session;
    }
  }
}

const app = express();
const csrfProtection = csrf();

const MongoDBSessionStore = MongoDBStore(session);
const store = new MongoDBSessionStore({
  uri: process.env.MONGODB_URI!,
  collection: "sessions",
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(favicon(path.join(__dirname, "public", "favicon.ico")));
app.use(cors());

//I needed to ensure that my file parser was loading before the csurf module...
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(multer({ storage: fileStorage, fileFilter }).single("image")); //arrray for multiple

app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));

app.use(helmet());
app.use(compression()); //exludes images, assets<1kb, heroku does not compress

app.use(
  session({
    name: "ts-authentication-app",
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);
app.use(csrfProtection);

app.use(flash());

app.use(isAuthroized);

app.use((req, res, next) => {
  // locals allows us to set local varibles into the views
  res.locals.isAuthenticated = req?.session?.isLoggedIn;
  // csrfToken() is provided by csrf middleware.
  res.locals.csrfToken = req.csrfToken();
  console.log("token", req.csrfToken());

  next();
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.get("/500", errorController.get500);
app.use(errorController.get404);
app.use(morgan("combined", { stream: morganLogStream }));
app.use(errorHandler);

app.listen(process.env.PORT, () => {
  console.log(`listening on  ${process.env.PORT}`);
});

export { app };
