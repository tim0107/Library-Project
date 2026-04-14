class ErrorResponse extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

module.exports = ErrorResponse;

// this handle error in controllers
