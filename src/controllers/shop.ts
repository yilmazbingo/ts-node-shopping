import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import Stripe from "stripe";
import { Product, Order, ProductDoc, CartItem } from "../database/models";
import { NextFunction, Request, Response } from "express";
import { NotFoundError } from "../errors/not-found-error";
import { InternalServerError, NotAuthorizedError } from "../errors";

const ITEMS_PER_PAGE = 2;
let stripe: Stripe;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2020-08-27",
  });
}

export const getProducts = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const page: number = req.query && req.query.page ? +req.query.page : 1;
  let totalItems: number;

  Product.find()
    .countDocuments()
    .then((numProducts) => {
      totalItems = numProducts;
      return Product.find()
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
      throw new NotFoundError();
    });
};

export const getProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const prodId = req.params.productId;
  const product = await Product.findById(prodId);
  if (!product) {
    throw new NotFoundError();
  }
  res.render("shop/product-detail", {
    product: product,
    pageTitle: product.title,
    path: "/products",
  });
};

export const getIndex = (req: Request, res: Response, next: NextFunction) => {
  const page: number = req.query && req.query.page ? +req.query.page : 1;
  let totalItems: number;
  Product.find()
    .countDocuments()
    .then((numProducts) => {
      totalItems = numProducts;
      return Product.find()
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
      throw new NotFoundError();
    });
};

export const getCart = (req: Request, res: Response, next: NextFunction) => {
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
    .catch((err: Error) => {
      throw new InternalServerError(err.message);
    });
};

export const postCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return;
  }

  const prodId = req.body.productId;
  const product = (await Product.findById(prodId)) as ProductDoc;
  if (!product) {
    throw new NotFoundError();
  }
  try {
    await req.user.addToCart(product);
    res.redirect("/cart");
  } catch (e) {
    throw new InternalServerError(e.message);
  }
};

export const postCartDeleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const prodId = req.body.productId;
  if (!req.user) {
    return;
  }
  try {
    await req.user.removeFromCart(prodId);

    res.redirect("/cart");
  } catch (e) {
    throw new InternalServerError(e.message);
  }
};
//---------------------------STRIPE IS IMPLEMENTED HERE---------------
export const getCheckout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let products: CartItem[];
  let total = 0;
  if (!req.user) {
    return;
  }
  try {
    const user = await req.user.populate("cart.items.productId").execPopulate();
    products = user.cart.items;
    total = 0;
    products.forEach((p) => {
      total += p.quantity * p.productId.price;
    });
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: products.map((p) => {
        return {
          name: p.productId.title,
          description: p.productId.description,
          amount: p.productId.price * 100, //CENTS
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
  } catch (e) {
    throw new InternalServerError(e.message);
  }
};

export const getCheckoutSuccess = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return;
  }
  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then((user) => {
      const products = user.cart.items.map((i) => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
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
      throw new InternalServerError(e.message);
    });
};

export const getOrders = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return;
  }
  Order.find({ "user.userId": req.user._id })
    .then((orders) => {
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your Orders",
        orders: orders,
      });
    })
    .catch((e) => {
      throw new InternalServerError(e.message);
    });
};

export const getInvoice = (req: Request, res: Response, next: NextFunction) => {
  const orderId = req.params.orderId;
  Order.findById(orderId)
    .then((order) => {
      if (!order) {
        throw new NotFoundError();
      }
      if (
        req.user &&
        order.user.userId.toString() !== req.user._id.toString()
      ) {
        throw new NotAuthorizedError();
      }
      const invoiceName = "invoice-" + orderId + ".pdf";
      const invoicePath = path.join("data", "invoices", invoiceName);

      const pdfDoc = new PDFDocument();
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        'inline; filename="' + invoiceName + '"'
      );
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
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
          .text(
            prod.product.title +
              " - " +
              prod.quantity +
              " x " +
              "$" +
              prod.product.price
          );
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
