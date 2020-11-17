import mongoose, { Types } from "mongoose";
import { UserDoc } from "./user";

const Schema = mongoose.Schema;
interface ProductAttrs {
  title: ProductDoc["title"];
  price: ProductDoc["price"];
  description: ProductDoc["description"];
  imageUrl: ProductDoc["imageUrl"];
  userId: ProductDoc["userId"];
}

//interface that describes the properties a user doc has.
export interface ProductDoc extends mongoose.Document {
  title: string;
  price: number;
  description: string;
  imageUrl: string;
  userId: UserDoc["_id"];
}

const productSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});
export const Product = mongoose.model<ProductDoc>("Product", productSchema);
