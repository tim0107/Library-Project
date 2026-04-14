const Message = require('../models/message');
const User = require('../models/user');

// app.js must export io + userSocketMap using module.exports
const { getIO, userSocketMap } = require('../socket');

const getUsersForSideBar = async (req, res) => {
  try {
    const userId = req.user._id;

    const users = await User.find({ _id: { $ne: userId } }).select('-password');

    const unseenMessage = {};

    await Promise.all(
      users.map(async (u) => {
        const count = await Message.countDocuments({
          senderId: u._id,
          receiverId: userId,
          seen: false,
        });

        if (count > 0) unseenMessage[u._id.toString()] = count;
      }),
    );

    return res.json({ success: true, users, unseenMessage });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// mark message as seen
const markMessageAsSeen = async (req, res) => {
  try {
    const { id } = req.params;
    await Message.findByIdAndUpdate(id, { seen: true });
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getMessages = async (req, res) => {
  try {
    const { id: selectedUserId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: selectedUserId },
        { senderId: selectedUserId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });

    // mark messages from selected user -> me as seen
    await Message.updateMany(
      { senderId: selectedUserId, receiverId: myId, seen: false },
      { seen: true },
    );

    return res.json({ success: true, messages });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user?._id;

    if (!senderId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!receiverId) {
      return res
        .status(400)
        .json({ success: false, message: 'Receiver id is required' });
    }

    if (!text || !text.trim()) {
      return res
        .status(400)
        .json({ success: false, message: 'Message text is required' });
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      text: text.trim(),
      seen: false,
    });

    // emit new message to receiver socket
    const receiverSocketId = userSocketMap[receiverId.toString()];
    if (receiverSocketId) {
      getIO().to(receiverSocketId).emit('newMessage', newMessage); // ✅ event name: lower-case recommended
    }

    return res.status(201).json({ success: true, newMessage });
  } catch (error) {
    console.log('sendMessage error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getUsersForSideBar,
  markMessageAsSeen,
  getMessages,
  sendMessage,
};
