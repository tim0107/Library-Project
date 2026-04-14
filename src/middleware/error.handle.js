module.exports = (err, req, res, next) => {
  let error = { ...err };

  if (err?.name === 'CastError') {
    error.status = 404;
    error.message = `Cant find the source`;
  }

  if (err.status === 400) {
    error.status = 400;
    error.message = err.message;
  }

  if (err.status === 401) {
    error.status = 401;
    error.message = err.message;
  }

  if (err.status === 403) {
    error.status = 403;
    error.message = err.message;
  }

  if (err.status === 404) {
    error.status = 404;
    error.message = err.message;
  }

  if (err.code === 11000) {
    error.status = 400;
    error.message = 'Data exited';
  }

  const status = error.status || 500;
  const message =
    error.message || err.message || 'Server error , try again later';

  return res.status(status).json({
    status,
    message,
  });
};
