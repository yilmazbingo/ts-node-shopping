import { CustomError } from "./custom-error";

export class InternalServerError extends CustomError {
  statusCode = 500;
  constructor(public message: string) {
    super(message);
    Object.setPrototypeOf(this, InternalServerError.prototype);
  }
  serializeErrors() {
    return [{ message: this.message }];
  }
}
