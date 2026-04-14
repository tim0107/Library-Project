const cartModel = require('../models/cart');
const ErrorResponse = require('../helpers/ErrorResponse');

const getBookKey = (book) => book?.id || book?.url;

module.exports = {
  createCart: async (req, res) => {
    const userId = req.user._id;
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      throw new ErrorResponse(400, 'Missing items[]');
    }

    const { book, quantity = 1 } = items[0];

    if (!book) {
      throw new ErrorResponse(400, 'Missing book');
    }

    const bookKey = getBookKey(book);
    if (!bookKey) {
      throw new ErrorResponse(400, 'Book must have id or url');
    }

    const qty = Number(quantity);
    if (Number.isNaN(qty) || qty <= 0) {
      throw new ErrorResponse(400, 'Quantity must be > 0');
    }

    let cartDoc = await cartModel.findOne({ userId });

    if (!cartDoc) {
      cartDoc = await cartModel.create({
        userId,
        items: [{ book, quantity: qty }],
      });
      return res.status(201).json(cartDoc);
    }

    const idx = cartDoc.items.findIndex(
      (it) => String(getBookKey(it.book)) === String(bookKey),
    );

    if (idx !== -1) {
      cartDoc.items[idx].quantity += qty;
    } else {
      cartDoc.items.push({ book, quantity: qty });
    }

    await cartDoc.save();
    return res.status(200).json(cartDoc);
  },

  getCartForUser: async (req, res) => {
    const userId = req.user._id;

    const cartDoc = await cartModel.findOne({ userId });

    if (!cartDoc) {
      return res.status(200).json({ userId, items: [] });
    }

    return res.status(200).json(cartDoc);
  },

  removeItem: async (req, res) => {
    const userId = req.user._id;
    const { bookId, quantity = 1 } = req.body;

    console.log('removeItem body:', req.body);

    if (!bookId) {
      throw new ErrorResponse(400, 'Missing bookId');
    }

    const qty = Number(quantity);
    if (Number.isNaN(qty) || qty <= 0) {
      throw new ErrorResponse(400, 'Quantity must be > 0');
    }

    const cartDoc = await cartModel.findOne({ userId });
    if (!cartDoc) {
      throw new ErrorResponse(404, 'Cart not found');
    }

    const idx = cartDoc.items.findIndex(
      (it) => String(it?.book?.id) === String(bookId),
    );

    if (idx === -1) {
      throw new ErrorResponse(404, 'Item not found in cart');
    }

    cartDoc.items[idx].quantity -= qty;

    if (cartDoc.items[idx].quantity <= 0) {
      cartDoc.items.splice(idx, 1);
    }

    await cartDoc.save();

    return res.status(200).json({
      success: true,
      message: 'Item removed successfully',
      items: cartDoc.items,
    });
  },

  updateQty: async (req, res) => {
    const userId = req.user._id;
    const { bookKey, quantity } = req.body;

    if (!bookKey) {
      throw new ErrorResponse(400, 'Missing bookKey');
    }

    if (quantity === undefined) {
      throw new ErrorResponse(400, 'Missing quantity');
    }

    const newQty = Number(quantity);
    if (Number.isNaN(newQty)) {
      throw new ErrorResponse(400, 'Quantity must be a number');
    }

    const cartDoc = await cartModel.findOne({ userId });
    if (!cartDoc) {
      throw new ErrorResponse(404, 'Cart not found');
    }

    const idx = cartDoc.items.findIndex(
      (it) => String(getBookKey(it.book)) === String(bookKey),
    );

    if (idx === -1) {
      throw new ErrorResponse(404, 'Item not found in cart');
    }

    if (newQty <= 0) {
      cartDoc.items.splice(idx, 1);
    } else {
      cartDoc.items[idx].quantity = newQty;
    }

    await cartDoc.save();
    return res.status(200).json(cartDoc);
  },

  clearCart: async (req, res) => {
    const userId = req.user._id;

    const cartDoc = await cartModel.findOne({ userId });

    if (!cartDoc) {
      return res.status(200).json({
        message: 'Cart cleared',
        userId,
        items: [],
      });
    }

    cartDoc.items = [];
    await cartDoc.save();

    return res.status(200).json({
      message: 'Cart cleared',
      cart: cartDoc,
    });
  },

  increaseQty: async (req, res) => {
    const userId = req.user._id;
    const { bookId } = req.body;

    if (!bookId) {
      throw new ErrorResponse(400, 'Missing bookId');
    }

    const cartDoc = await cartModel.findOne({ userId });
    if (!cartDoc) {
      throw new ErrorResponse(404, 'Cart not found');
    }

    const idx = cartDoc.items.findIndex(
      (item) => String(getBookKey(item.book)) === String(bookId),
    );

    if (idx === -1) {
      throw new ErrorResponse(404, 'Item not in cart');
    }

    cartDoc.items[idx].quantity += 1;

    await cartDoc.save();
    return res.status(200).json(cartDoc);
  },

  decreaseQty: async (req, res) => {
    const userId = req.user._id;
    const { bookId } = req.body;

    if (!bookId) {
      throw new ErrorResponse(400, 'Missing bookId');
    }

    const cartDoc = await cartModel.findOne({ userId });
    if (!cartDoc) {
      throw new ErrorResponse(404, 'Cart not found');
    }

    const idx = cartDoc.items.findIndex(
      (item) => String(getBookKey(item.book)) === String(bookId),
    );

    if (idx === -1) {
      throw new ErrorResponse(404, 'Item not found');
    }

    cartDoc.items[idx].quantity -= 1;

    if (cartDoc.items[idx].quantity <= 0) {
      cartDoc.items.splice(idx, 1);
    }

    await cartDoc.save();
    return res.status(200).json(cartDoc);
  },
};
