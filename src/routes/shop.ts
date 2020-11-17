import path from "path";
import express from "express";
import * as shopController from "../controllers/shop";
import { isAuth } from "../middleware/is-auth";

const router = express.Router();

router.get("/", shopController.getIndex);
router.get("/products", shopController.getProducts);
router.get("/products/:productId", shopController.getProduct);
router.get("/cart", isAuth, shopController.getCart);
router.post("/cart", isAuth, shopController.postCart);
router.post("/cart-delete-item", isAuth, shopController.postCartDeleteProduct);
router.get("/checkout", isAuth, shopController.getCheckout);
// router.post("/create-order", isAuth, shopController.postOrder);
router.get("/orders", isAuth, shopController.getOrders);
router.get("/orders/:orderId", isAuth, shopController.getInvoice);
router.get("/checkout/success", shopController.getCheckoutSuccess);
router.get("/checkout/cancel", shopController.getCheckout);

export { router as shopRoutes };
