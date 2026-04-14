const User = require('../models/user');
const ErrorResponse = require('../helpers/ErrorResponse');

module.exports = {
  sendFriendRequest: async (req, res) => {
    const userId = req.user._id;
    const { receiverId } = req.body;

    if (!receiverId) {
      throw new ErrorResponse(400, 'receiverId is required');
    }

    if (receiverId.toString() === userId.toString()) {
      throw new ErrorResponse(400, "You can't add yourself");
    }

    const outgoing = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { outGoingFriendRequest: receiverId } },
      { new: true },
    );

    if (!outgoing) {
      throw new ErrorResponse(404, 'Cannot find sender');
    }

    const receiver = await User.findById(receiverId);

    const incoming = await User.findByIdAndUpdate(
      receiverId,
      { $addToSet: { inComingFriendRequest: userId } },
      { new: true },
    );

    if (!incoming) {
      throw new ErrorResponse(404, 'Cannot find receiver');
    }

    return res.status(200).json({
      message: 'Friend request sent successfully',
      userName: receiver?.userName,
    });
  },

  // accepter = req.user, requesterId comes from frontend (button click)
  acceptFriendRequest: async (req, res) => {
    const userId = req.user._id;
    const { requesterId } = req.body;

    if (!requesterId) {
      throw new ErrorResponse(400, 'requesterId is required');
    }

    const me = await User.findByIdAndUpdate(
      userId,
      {
        $addToSet: { friends: requesterId },
        $pull: { inComingFriendRequest: requesterId },
      },
      { new: true },
    );

    if (!me) {
      throw new ErrorResponse(404, 'Cannot find current user');
    }

    const requester = await User.findByIdAndUpdate(
      requesterId,
      {
        $addToSet: { friends: userId },
        $pull: { outGoingFriendRequest: userId },
      },
      { new: true },
    );

    if (!requester) {
      throw new ErrorResponse(404, 'Cannot find requester user');
    }

    return res.status(200).json({ message: 'Friend request accepted' });
  },

  rejectFriendRequest: async (req, res) => {
    const userId = req.user._id;
    const { friendId } = req.body;

    if (!friendId) {
      throw new ErrorResponse(400, 'friendId is required');
    }

    const me = await User.findByIdAndUpdate(
      userId,
      { $pull: { inComingFriendRequest: friendId } },
      { new: true },
    );

    if (!me) {
      throw new ErrorResponse(404, 'User not found');
    }

    const sender = await User.findByIdAndUpdate(
      friendId,
      { $pull: { outGoingFriendRequest: userId } },
      { new: true },
    );

    if (!sender) {
      throw new ErrorResponse(404, 'Sender not found');
    }

    return res.status(200).json({ message: 'Friend request rejected' });
  },

  deleteFriend: async (req, res) => {
    const userId = req.user._id;
    const { friendId } = req.body;

    if (!friendId) {
      throw new ErrorResponse(400, 'friendId is required');
    }

    const me = await User.findByIdAndUpdate(
      userId,
      { $pull: { friends: friendId } },
      { new: true },
    );

    if (!me) {
      throw new ErrorResponse(404, 'Cannot find current user');
    }

    const friend = await User.findByIdAndUpdate(
      friendId,
      { $pull: { friends: userId } },
      { new: true },
    );

    if (!friend) {
      throw new ErrorResponse(404, 'Cannot find friend user');
    }

    return res.status(200).json({ message: 'Friend removed successfully' });
  },

  getAllFriend: async (req, res) => {
    const userId = req.user._id;

    const user = await User.findById(userId).populate(
      'friends',
      'userName email avatarPicture blog friends favourites',
    );

    if (!user) {
      throw new ErrorResponse(404, 'User not found');
    }

    return res.status(200).json(user.friends);
  },

  getAllFriendNearBy: async (req, res) => {
    const meId = req.user._id;

    const friends = req.user.friends || [];
    const outGoing = req.user.outGoingFriendRequest || [];

    const excludeIds = [meId, ...friends, ...outGoing];

    const data = await User.find({
      _id: { $nin: excludeIds },
    }).select('-password');

    return res.status(200).json(data);
  },

  getAllFriendRequest: async (req, res) => {
    const userId = req.user._id;

    const user = await User.findById(userId).populate(
      'inComingFriendRequest',
      'userName email',
    );

    if (!user) {
      throw new ErrorResponse(404, 'User not found');
    }

    return res.status(200).json(user.inComingFriendRequest);
  },

  getAllFriendOutGoing: async (req, res) => {
    const userId = req.user._id;

    const user = await User.findById(userId).populate(
      'outGoingFriendRequest',
      'userName email',
    );

    if (!user) {
      throw new ErrorResponse(404, 'User not found');
    }

    return res.status(200).json(user.outGoingFriendRequest);
  },

  cancelMyFriendRequest: async (req, res) => {
    const userId = req.user._id;
    const { friendId } = req.body;

    if (!friendId) {
      throw new ErrorResponse(400, 'friendId is required');
    }

    const me = await User.findByIdAndUpdate(
      userId,
      { $pull: { outGoingFriendRequest: friendId } },
      { new: true },
    );

    const you = await User.findByIdAndUpdate(
      friendId,
      { $pull: { inComingFriendRequest: userId } },
      { new: true },
    );

    if (!me || !you) {
      throw new ErrorResponse(400, 'something went wrong');
    }

    return res.status(200).json({
      success: true,
      message: 'Friend request cancelled',
    });
  },

  isFriend: async (req, res) => {
    const userId = req.user._id;
    const { friendId } = req.body;

    if (!friendId) {
      throw new ErrorResponse(400, 'friendId is required');
    }

    const user = await User.findById(userId).select('friends');

    if (!user) {
      throw new ErrorResponse(404, 'User not found');
    }

    const isFriend = user.friends.some(
      (id) => id.toString() === friendId.toString(),
    );

    return res.status(200).json({ isFriend });
  },

  goToFriendProfile: async (req, res) => {
    const userId = req.user._id;
    const friendId = req.params.friendId;

    if (!friendId) {
      throw new ErrorResponse(400, 'friendId is required');
    }

    const data = await User.findById(friendId).select('-password');

    if (!data) {
      throw new ErrorResponse(404, 'User not found');
    }

    const isFriend = await User.exists({
      _id: userId,
      friends: friendId,
    });

    return res.status(200).json({
      data,
      isThisFriend: !!isFriend,
    });
  },

  unFriend: async (req, res) => {
    const userId = req.user._id;
    const friendId = req.params.friendId;

    if (!friendId) {
      throw new ErrorResponse(400, 'friendId is required');
    }

    if (userId.toString() === friendId.toString()) {
      throw new ErrorResponse(400, 'Cannot unfriend yourself');
    }

    const isFriend = await User.exists({
      _id: userId,
      friends: friendId,
    });

    if (!isFriend) {
      throw new ErrorResponse(400, 'You are not friends');
    }

    await User.findByIdAndUpdate(userId, {
      $pull: { friends: friendId },
    });

    await User.findByIdAndUpdate(friendId, {
      $pull: { friends: userId },
    });

    return res.status(200).json({ message: 'Unfriended successfully' });
  },
};
