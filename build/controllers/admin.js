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
exports.deleteProduct = exports.getProducts = exports.postEditProduct = exports.getEditProduct = exports.postAddProduct = exports.getAddProduct = void 0;
const path_1 = __importDefault(require("path"));
const express_validator_1 = require("express-validator");
const models_1 = require("../database/models");
const errors_1 = require("../errors");
const cloudinary_1 = require("../services/cloudinary");
// import { dataUri } from "../services/dataUri";
// import DataUri from "datauri";
const parser_1 = __importDefault(require("datauri/parser"));
const parser = new parser_1.default();
exports.getAddProduct = (req, res, next) => {
    res.render("admin/edit-product", {
        pageTitle: "Add Product",
        path: "/admin/add-product",
        // to distinguish between editing or adding new item, i will send req.query
        editing: false,
        hasError: false,
        errorMessage: null,
        validationErrors: [],
    });
};
exports.postAddProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const title = req.body.title;
    const extName = path_1.default.extname(req.file.originalname).toString();
    // console.log("extname", extName);
    const file64 = parser.format(extName, req.file.buffer);
    // const file64OmitNewLine = file64.replace(/(\r\n|\n|\r)/gm, "");
    const price = req.body.price;
    const description = req.body.description;
    if (!req.file) {
        return res.status(422).render("admin/edit-product", {
            pageTitle: "Add Product",
            path: "/admin/add-product",
            editing: false,
            hasError: true,
            product: {
                title: title,
                price: price,
                description: description,
            },
            errorMessage: "Attached file is not an image.",
            validationErrors: [],
        });
    }
    const errors = express_validator_1.validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render("admin/edit-product", {
            pageTitle: "Add Product",
            path: "/admin/add-product",
            editing: false,
            hasError: true,
            product: {
                title: title,
                price: price,
                description: description,
            },
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array(),
        });
    }
    try {
        // const imageUrl = image.path;
        const result = yield cloudinary_1.Cloudinary.upload(file64.content);
        console.log("result", result);
        const product = new models_1.Product({
            title: title,
            price: price,
            description: description,
            // result is secure url
            imageUrl: result,
            userId: req.user._id,
        });
        yield product.save();
        res.redirect("/admin/products");
    }
    catch (err) {
        console.log("error in posting", err);
        // next(new InternalServerError(err.message));
        next(err.message);
    }
});
exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if (!editMode) {
        return res.redirect("/");
    }
    const prodId = req.params.productId;
    models_1.Product.findById(prodId)
        .then((product) => {
        if (!product) {
            return res.redirect("/");
        }
        res.render("admin/edit-product", {
            pageTitle: "Edit Product",
            path: "/admin/edit-product",
            editing: editMode,
            product: product,
            hasError: false,
            errorMessage: null,
            validationErrors: [],
        });
    })
        .catch((err) => {
        // when we call next() with an argument passed in, we let express know, we skip all other middlewares, we move to error handling middleware
        next(new errors_1.InternalServerError("Internal Server Error"));
    });
};
exports.postEditProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const image = req.file;
    const updatedDesc = req.body.description;
    const errors = express_validator_1.validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render("admin/edit-product", {
            pageTitle: "Edit Product",
            path: "/admin/edit-product",
            editing: true,
            hasError: true,
            product: {
                title: updatedTitle,
                price: updatedPrice,
                description: updatedDesc,
                _id: prodId,
            },
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array(),
        });
    }
    try {
        const product = (yield models_1.Product.findById(prodId));
        if (req.user && product.userId.toString() !== req.user._id.toString()) {
            return res.redirect("/");
        }
        product.title = updatedTitle;
        product.price = updatedPrice;
        product.description = updatedDesc;
        if (image) {
            // deleteFile(product.imageUrl);
            // product.imageUrl = image.path;
        }
        yield product.save();
        res.redirect("/admin/products");
    }
    catch (e) {
        // throw new NotFoundError();
        next(new errors_1.NotFoundError());
    }
});
exports.getProducts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.user) {
        try {
            const products = yield models_1.Product.find({ userId: req.user._id });
            res.render("admin/products", {
                prods: products,
                pageTitle: "Admin Products",
                path: "/admin/products",
            });
        }
        catch (e) {
            throw new errors_1.InternalServerError("Internal Server Error");
        }
    }
});
exports.deleteProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        return;
    }
    const prodId = req.params.productId;
    const product = yield models_1.Product.findById(prodId);
    if (!product) {
        throw new errors_1.NotFoundError();
    }
    // deleteFile(product.imageUrl);
    try {
        yield models_1.Product.deleteOne({ _id: prodId, userId: req.user._id });
        res.status(200).json({ message: "Success!" });
    }
    catch (e) {
        throw new errors_1.InternalServerError(e.message);
    }
});
