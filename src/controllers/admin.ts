import { deleteFile } from "../util/file";
import { validationResult } from "express-validator";
import { Product, ProductDoc } from "../database/models";
import { Request, Response, NextFunction } from "express";
import { InternalServerError, NotFoundError } from "../errors";

export const getAddProduct = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    // to distinguish between editing or adding new item, i will send req.query
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: [], //ejs is expecting
  });
};

export const postAddProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;
  if (!image) {
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
  const errors = validationResult(req);
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
    const imageUrl = image.path;
    const product = new Product({
      title: title,
      price: price,
      description: description,
      imageUrl: imageUrl,
      userId: req.user!._id,
    });
    await product.save();
    res.redirect("/admin/products");
  } catch (err) {
    throw new InternalServerError(err.message);
  }
};

export const getEditProduct = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
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
      throw new InternalServerError("Internal Server Error");
    });
};

export const postEditProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const image = req.file;
  const updatedDesc = req.body.description;
  const errors = validationResult(req);
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
    const product = (await Product.findById(prodId)) as ProductDoc;
    if (req.user && product.userId.toString() !== req.user._id.toString()) {
      return res.redirect("/");
    }
    product.title = updatedTitle;
    product.price = updatedPrice;
    product.description = updatedDesc;
    if (image) {
      deleteFile(product.imageUrl);
      product.imageUrl = image.path;
    }
    await product.save();
    res.redirect("/admin/products");
  } catch (e) {
    throw new NotFoundError();
  }
};

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.user) {
    try {
      const products = await Product.find({ userId: req.user._id });
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
      });
    } catch (e) {
      throw new InternalServerError("Internal Server Error");
    }
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return;
  }
  const prodId = req.params.productId;
  const product = await Product.findById(prodId);
  if (!product) {
    throw new NotFoundError();
  }
  deleteFile(product.imageUrl);
  try {
    await Product.deleteOne({ _id: prodId, userId: req.user._id });
    res.status(200).json({ message: "Success!" });
  } catch (e) {
    throw new InternalServerError(e.message);
  }
};
