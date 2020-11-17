"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInvoice = exports.getOrders = exports.getCheckoutSuccess = exports.getCheckout = exports.postCartDeleteProduct = exports.postCart = exports.getCart = exports.getIndex = exports.getProduct = exports.getProducts = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const pdfkit_1 = __importDefault(require("pdfkit"));
const stripe_1 = __importDefault(require("stripe"));
const models_1 = require("../database/models");
const not_found_error_1 = require("../errors/not-found-error");
const errors_1 = require("../errors");
const ITEMS_PER_PAGE = 2;
let stripe;
if (process.env.STRIPE_SECRET_KEY) {
    stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
        apiVersion: "2020-08-27",
    });
}
exports.getProducts = (req, res, next) => {
    const page = req.query && req.query.page ? +req.query.page : 1;
    let totalItems;
    models_1.Product.find()
        .countDocuments()
        .then((numProducts) => {
        totalItems = numProducts;
        return models_1.Product.find()
            .skip((page - 1) * ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE);
    })
        .then((products) => {
        res.render("shop/product-list", {
            prods: products,
            pageTitle: "Products",
            path: "/products",
            currentPage: page,
            hasNextPage: ITEMS_PER_PAGE * page < totalItems,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
        });
    })
        .catch((err) => {
        throw new not_found_error_1.NotFoundError();
    });
};
exports.getProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const prodId = req.params.productId;
    const product = yield models_1.Product.findById(prodId);
    if (!product) {
        throw new not_found_error_1.NotFoundError();
    }
    res.render("shop/product-detail", {
        product: product,
        pageTitle: product.title,
        path: "/products",
    });
});
exports.getIndex = (req, res, next) => {
    const page = req.query && req.query.page ? +req.query.page : 1;
    let totalItems;
    models_1.Product.find()
        .countDocuments()
        .then((numProducts) => {
        totalItems = numProducts;
        return models_1.Product.find()
            .skip((page - 1) * ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE);
    })
        .then((products) => {
        res.render("shop/index", {
            prods: products,
            pageTitle: "Shop",
            path: "/",
            currentPage: page,
            hasNextPage: ITEMS_PER_PAGE * page < totalItems,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
        });
    })
        .catch((err) => {
        throw new not_found_error_1.NotFoundError();
    });
};
exports.getCart = (req, res, next) => {
    if (!req.user) {
        return;
    }
    req.user
        .populate("cart.items.productId")
        .execPopulate()
        .then((user) => {
        const products = user.cart.items;
        res.render("shop/cart", {
            path: "/cart",
            pageTitle: "Your Cart",
            products: products,
        });
    })
        .catch((err) => {
        throw new errors_1.InternalServerError(err.message);
    });
};
exports.postCart = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        return;
    }
    const prodId = req.body.productId;
    const product = (yield models_1.Product.findById(prodId));
    if (!product) {
        throw new not_found_error_1.NotFoundError();
    }
    try {
        yield req.user.addToCart(product);
        res.redirect("/cart");
    }
    catch (e) {
        throw new errors_1.InternalServerError(e.message);
    }
});
exports.postCartDeleteProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const prodId = req.body.productId;
    if (!req.user) {
        return;
    }
    try {
        yield req.user.removeFromCart(prodId);
        res.redirect("/cart");
    }
    catch (e) {
        throw new errors_1.InternalServerError(e.message);
    }
});
//---------------------------STRIPE IS IMPLEMENTED HERE---------------
exports.getCheckout = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let products;
    let total = 0;
    if (!req.user) {
        return;
    }
    try {
        const user = yield req.user.populate("cart.items.productId").execPopulate();
        products = user.cart.items;
        total = 0;
        products.forEach((p) => {
            total += p.quantity * p.productId.price;
        });
        const session = yield stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: products.map((p) => {
                return {
                    name: p.productId.title,
                    description: p.productId.description,
                    amount: p.productId.price * 100,
                    currency: "usd",
                    quantity: p.quantity,
                };
            }),
            success_url: `${req.protocol}://${req.get("host")}/checkout/success`,
            cancel_url: `${req.protocol}://${req.get("host")}/checkout/cancel`,
        });
        res.render("shop/checkout", {
            path: "/checkout",
            pageTitle: "Checkout",
            products: products,
            totalSum: total,
            sessionId: session.id,
        });
    }
    catch (e) {
        throw new errors_1.InternalServerError(e.message);
    }
});
exports.getCheckoutSuccess = (req, res, next) => {
    if (!req.user) {
        return;
    }
    req.user
        .populate("cart.items.productId")
        .execPopulate()
        .then((user) => {
        const products = user.cart.items.map((i) => {
            return { quantity: i.quantity, product: Object.assign({}, i.productId._doc) };
        });
        const order = new models_1.Order({
            user: {
                email: req.user ? req.user.email : null,
                userId: req.user,
            },
            products: products,
        });
        return order.save();
    })
        .then((result) => {
        if (!req.user) {
            return;
        }
        return req.user.clearCart();
    })
        .then(() => {
        res.redirect("/orders");
    })
        .catch((e) => {
        throw new errors_1.InternalServerError(e.message);
    });
};
exports.getOrders = (req, res, next) => {
    if (!req.user) {
        return;
    }
    models_1.Order.find({ "user.userId": req.user._id })
        .then((orders) => {
        res.render("shop/orders", {
            path: "/orders",
            pageTitle: "Your Orders",
            orders: orders,
        });
    })
        .catch((e) => {
        throw new errors_1.InternalServerError(e.message);
    });
};
exports.getInvoice = (req, res, next) => {
    const orderId = req.params.orderId;
    models_1.Order.findById(orderId)
        .then((order) => {
        if (!order) {
            throw new not_found_error_1.NotFoundError();
        }
        if (req.user &&
            order.user.userId.toString() !== req.user._id.toString()) {
            throw new errors_1.NotAuthorizedError();
        }
        const invoiceName = "invoice-" + orderId + ".pdf";
        const invoicePath = path_1.default.join("data", "invoices", invoiceName);
        const pdfDoc = new pdfkit_1.default();
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", 'inline; filename="' + invoiceName + '"');
        pdfDoc.pipe(fs_1.default.createWriteStream(invoicePath));
        pdfDoc.pipe(res);
        pdfDoc.fontSize(26).text("Invoice", {
            underline: true,
        });
        pdfDoc.text("-----------------------");
        let totalPrice = 0;
        order.products.forEach((prod) => {
            totalPrice += prod.quantity * prod.product.price;
            pdfDoc
                .fontSize(14)
                .text(prod.product.title +
                " - " +
                prod.quantity +
                " x " +
                "$" +
                prod.product.price);
        });
        pdfDoc.text("---");
        pdfDoc.fontSize(20).text("Total Price: $" + totalPrice);
        pdfDoc.end();
        // fs.readFile(invoicePath, (err, data) => {
        //   if (err) {
        //     return next(err);
        //   }
        //   res.setHeader('Content-Type', 'application/pdf');
        //   res.setHeader(
        //     'Content-Disposition',
        //     'inline; filename="' + invoiceName + '"'
        //   );
        //   res.send(data);
        // });
        // const file = fs.createReadStream(invoicePath);
        // file.pipe(res);
    })
        .catch((err) => next(err));
};
