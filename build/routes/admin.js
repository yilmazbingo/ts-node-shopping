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
exports.adminRoutes = void 0;
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const adminController = __importStar(require("../controllers/admin"));
const is_auth_1 = require("../middleware/is-auth");
const router = express_1.default.Router();
exports.adminRoutes = router;
router.get("/add-product", is_auth_1.isAuth, adminController.getAddProduct);
router.get("/products", is_auth_1.isAuth, adminController.getProducts);
router.post("/add-product", [
    express_validator_1.body("title").isString().isLength({ min: 3 }).trim(),
    express_validator_1.body("price").isFloat(),
    express_validator_1.body("description").isLength({ min: 5, max: 400 }).trim(),
], is_auth_1.isAuth, adminController.postAddProduct);
router.get("/edit-product/:productId", is_auth_1.isAuth, adminController.getEditProduct);
router.post("/edit-product", [
    express_validator_1.body("title").isString().isLength({ min: 3 }).trim(),
    express_validator_1.body("price").isFloat(),
    express_validator_1.body("description").isLength({ min: 5, max: 400 }).trim(),
], is_auth_1.isAuth, adminController.postEditProduct);
router.delete("/product/:productId", is_auth_1.isAuth, adminController.deleteProduct);
