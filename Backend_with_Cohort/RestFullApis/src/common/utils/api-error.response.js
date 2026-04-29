class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message) {
    return new ApiError(400, message);
  }

  static unAuthorized(message) {
    return new ApiError(400, message);
  }

  static notFound(message) {
    return new ApiError(404, message);
  }

  static internal(message) {
    return new ApiError(500, message);
  }
}

export default ApiError;

// uses
// ApiError.badRequest("message");
// ApiError.unAuthorized("message");
// ApiError.notFound("message");
// ApiError.internal("message");
