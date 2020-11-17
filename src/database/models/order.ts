import mongoose from "mongoose";
import { ProductDoc } from "./product";
import { UserDoc } from "./user";

const Schema = mongoose.Schema;

interface OrderDoc extends mongoose.Document {
  products: { product: ProductDoc; quantity: number }[];
  user: { email: UserDoc["email"]; userId: UserDoc["_id"] };
}

const orderSchema = new Schema({
  products: [
    {
      product: { type: Object, required: true },
      quantity: { type: Number, required: true },
    },
  ],
  user: {
    email: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
});

export const Order = mongoose.model<OrderDoc>("Order", orderSchema);
