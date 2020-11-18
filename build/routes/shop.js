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
exports.shopRoutes = void 0;
const express_1 = __importDefault(require("express"));
const shopController = __importStar(require("../controllers/shop"));
const is_auth_1 = require("../middleware/is-auth");
const router = express_1.default.Router();
exports.shopRoutes = router;
router.get("/", shopController.getIndex);
router.get("/products", shopController.getProducts);
router.get("/products/:productId", shopController.getProduct);
router.get("/cart", is_auth_1.isAuth, shopController.getCart);
router.post("/cart", is_auth_1.isAuth, shopController.postCart);
router.post("/cart-delete-item", is_auth_1.isAuth, shopController.postCartDeleteProduct);
router.get("/checkout", is_auth_1.isAuth, shopController.getCheckout);
// router.post("/create-order", isAuth, shopController.postOrder);
router.get("/orders", is_auth_1.isAuth, shopController.getOrders);
router.get("/orders/:orderId", is_auth_1.isAuth, shopController.getInvoice);
router.get("/checkout/success", shopController.getCheckoutSuccess);
router.get("/checkout/cancel", shopController.getCheckout);
