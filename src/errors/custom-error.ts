export abstract class CustomError extends Error {
  abstract statusCode: number;
  constructor(message: string) {
    super(message);
    // every function has a prototype object that’s automatically set as the prototype of the objects created with that function.
    // this is set to be able to use isntance of method
    Object.setPrototypeOf(this, CustomError.prototype);
  }
  //   this is not a method. it is a method signature. abstract class should have at least one method
  abstract serializeErrors(): { message: string; field?: string }[];
}
