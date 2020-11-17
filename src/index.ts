import "./database/index";
import "./app";
if (!process.env.STRIPE_SECRET_KEY && !process.env.SESSION_SECRET) {
  console.log("STRIPE_SECRET_KEY and EXPRESS  SESSION_SECRET are missing");
  process.exit(1);
}
