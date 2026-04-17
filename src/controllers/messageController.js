const Message = require('../models/message');
const User = require('../models/user');
const { getIO, userSocketMap } = require('../socket');

// get all users for sidebar + unseen counts
const getUsersForSideBar = async (req, res) => {
  try {
    const myId = req.user._id;

    const users = await User.find({ _id: { $ne: myId } }).select('-password');

    const unseenMessage = {};

    await Promise.all(
      users.map(async (user) => {
        const count = await Message.countDocuments({
          senderId: user._id,
          receiverId: myId,
          seen: false,
        });

        if (count > 0) {
          unseenMessage[user._id.toString()] = count;
        }
      }),
    );

    return res.status(200).json({
      success: true,
      users,
      unseenMessage,
    });
  } catch (error) {
    console.error('getUsersForSideBar error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load users',
    });
  }
};

// get shared conversation between me and selected user
const getMessages = async (req, res) => {
  try {
    const myId = req.user._id;
    const selectedUserId = req.params.id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: selectedUserId },
        { senderId: selectedUserId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });

    // mark messages from selected user to me as seen
    await Message.updateMany(
      {
        senderId: selectedUserId,
        receiverId: myId,
        seen: false,
      },
      {
        $set: { seen: true },
      },
    );

    return res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error('getMessages error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load messages',
    });
  }
};

// send message to another user
const sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    const receiverId = req.params.id;
    const text = req.body.text?.trim() || '';
    const image = req.body.image?.trim() || '';

    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: 'Receiver id is required',
      });
    }

    if (!text && !image) {
      return res.status(400).json({
        success: false,
        message: 'Message must contain text or image',
      });
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      text,
      image,
      seen: false,
    });

    // send realtime message to receiver if online
    const receiverSocketId = userSocketMap[receiverId.toString()];
    if (receiverSocketId) {
      getIO().to(receiverSocketId).emit('newMessage', newMessage);
    }

    // optional: also emit back to sender's other tabs/devices
    const senderSocketId = userSocketMap[senderId.toString()];
    if (senderSocketId) {
      getIO().to(senderSocketId).emit('messageSent', newMessage);
    }

    return res.status(201).json({
      success: true,
      newMessage,
    });
  } catch (error) {
    console.error('sendMessage error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send message',
    });
  }
};

// mark one message as seen
const markMessageAsSeen = async (req, res) => {
  try {
    const messageId = req.params.id;

    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      { $set: { seen: true } },
      { new: true },
    );

    if (!updatedMessage) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: updatedMessage,
    });
  } catch (error) {
    console.error('markMessageAsSeen error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to mark message as seen',
    });
  }
};

module.exports = {
  getUsersForSideBar,
  getMessages,
  sendMessage,
  markMessageAsSeen,
};
