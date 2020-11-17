import mongoose from "mongoose";
const Schema = mongoose.Schema;
import { ProductDoc } from "./product";

interface UserAttrs {
  email: UserDoc["email"];
  password: UserDoc["password"];
}
// an interface that describes the properties that a user model has
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

//interface that describes the properties a user doc has.
export interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
  resetToken?: string;
  cart: { items: CartItem[] };
  resetTokenExpiration?: Date;
  addToCart: (product: ProductDoc) => boolean;
  removeFromCart: (productId: ProductDoc["_id"]) => boolean;
  clearCart: () => boolean;
}

export interface CartItem {
  productId: ProductDoc["_id"];
  quantity: number;
}

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  resetToken: String,
  resetTokenExpiration: Date,
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],
  },
});

userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};
userSchema.methods.addToCart = function (product: ProductDoc) {
  const cartProductIndex = this.cart.items.findIndex((cp: CartItem) => {
    return cp.productId.toString() === product._id.toString();
  });
  let newQuantity = 1;
  const updatedCartItems = [...this.cart.items];

  if (cartProductIndex >= 0) {
    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
    updatedCartItems[cartProductIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push({
      productId: product._id,
      quantity: newQuantity,
    });
  }
  const updatedCart = {
    items: updatedCartItems,
  };
  this.cart = updatedCart;
  return this.save();
};

userSchema.methods.removeFromCart = function (productId: ProductDoc["_id"]) {
  const updatedCartItems = this.cart.items.filter((item: CartItem) => {
    return item.productId.toString() !== productId.toString();
  });
  this.cart.items = updatedCartItems;
  return this.save();
};

userSchema.methods.clearCart = function () {
  this.cart = { items: [] };
  return this.save();
};

export const User = mongoose.model<UserDoc, UserModel>("User", userSchema);
