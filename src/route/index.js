const userRoute = require('./user.router');
const bookRoute = require('./book.route');
const cateRoute = require('./category.route');
const authorRoute = require('./author.route');
const categoryGoogle = require('./categoryGoogleApi');
const nycRoute = require('./nyc.route');
const messageRoute = require('./message.route');
const authRoute = require('./auth.route');
const favRoute = require('./favourites');
const friendRoute = require('./friend.route');
const blogRoute = require('./blog.route');
const cartRoute = require('./cart.route');
const suggestRoute = require('./suggest.router');

console.log('from index router');

module.exports = (app) => {
  app.use('/user', userRoute);
  app.use('/book', bookRoute);
  app.use('/category', cateRoute);
  app.use('/author', authorRoute);
  app.use('/googleApi', categoryGoogle);
  app.use('/nyc', nycRoute);
  app.use('/message', messageRoute);
  app.use('/auth', authRoute);
  app.use('/favourite', favRoute);
  app.use('/friend', friendRoute);
  app.use('/blog', blogRoute);
  app.use('/cart', cartRoute);
  app.use('/suggest', suggestRoute);
};
