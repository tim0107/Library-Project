const blog = require('../models/blog');
const user = require('../models/user');
const ErrorResponse = require('../helpers/ErrorResponse');

module.exports = {
  createBlog: async (req, res) => {
    const userId = req.user._id;
    const { blogContent, blogImg } = req.body;

    if (!blogContent || !blogContent.trim()) {
      throw new ErrorResponse(400, 'blogContent is required');
    }

    const newBlog = await blog.create({
      userId,
      blogContent: blogContent.trim(),
      blogImg,
    });

    return res.status(201).json({
      message: 'created blog',
      data: newBlog,
    });
  },

  getAllBlog: async (req, res) => {
    const findAllBlog = await blog
      .find({})
      .sort({ createdAt: -1 })
      .populate('userId', 'userName avatarPicture')
      .populate('whoReact.user', 'userName avatarPicture');

    return res.status(200).json({
      message: 'here u go',
      data: findAllBlog,
    });
  },

  getAllMineBlog: async (req, res) => {
    const userId = req.user._id;

    const myBlogs = await blog
      .find({ userId })
      .sort({ createdAt: -1 })
      .populate('userId', 'userName avatarPicture')
      .populate('whoReact.user', 'userName avatarPicture');

    return res.status(200).json({
      message: 'here u go',
      data: myBlogs,
    });
  },

  getBlogNewFeed: async (req, res) => {
    const userId = req.user._id;

    const me = await user.findById(userId).select('friends');
    if (!me) {
      throw new ErrorResponse(404, 'User not found');
    }

    const authorIds = [...me.friends];

    const feed = await blog
      .find({
        userId: { $in: authorIds },
      })
      .sort({ createdAt: -1 })
      .populate('userId', 'userName avatarPicture')
      .populate('whoReact.user', 'userName avatarPicture');

    return res.status(200).json({
      message: 'here u go',
      data: feed,
    });
  },

  updateBlog: async (req, res) => {
    const userId = req.user._id;
    const { blogId } = req.params;
    const { blogContent, blogImg } = req.body;

    const updateData = {};

    if (typeof blogContent === 'string') {
      if (!blogContent.trim()) {
        throw new ErrorResponse(400, 'blogContent cannot be empty');
      }
      updateData.blogContent = blogContent.trim();
    }

    if (blogImg !== undefined) {
      updateData.blogImg = blogImg;
    }

    const updatedBlog = await blog.findOneAndUpdate(
      { _id: blogId, userId },
      updateData,
      { new: true, runValidators: true },
    );

    if (!updatedBlog) {
      throw new ErrorResponse(404, 'Blog not found or unauthorized');
    }

    return res.status(200).json({
      message: 'updated',
      data: updatedBlog,
    });
  },

  deleteBlog: async (req, res) => {
    const userId = req.user._id;
    const { blogId } = req.params;

    const deleted = await blog.findOneAndDelete({ _id: blogId, userId });

    if (!deleted) {
      throw new ErrorResponse(404, 'Blog not found or unauthorized');
    }

    return res.status(200).json({
      message: 'deleted',
      data: deleted,
    });
  },

  getTrendingBlog: async (req, res) => {
    const trending = await blog.aggregate([
      {
        $addFields: {
          commentCount: { $size: { $ifNull: ['$comment', []] } },
          reactCount: {
            $size: {
              $filter: {
                input: { $ifNull: ['$whoReact', []] },
                as: 'r',
                cond: { $ne: ['$$r.reacted', 'None'] },
              },
            },
          },
        },
      },
      {
        $addFields: {
          score: { $add: ['$commentCount', '$reactCount'] },
        },
      },
      { $sort: { score: -1, createdAt: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userId',
        },
      },
      { $unwind: { path: '$userId', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          blogContent: 1,
          blogImg: 1,
          whoReact: 1,
          comment: 1,
          createdAt: 1,
          score: 1,
          'userId._id': 1,
          'userId.userName': 1,
          'userId.avatarPicture': 1,
        },
      },
    ]);

    return res.status(200).json({
      message: 'done',
      data: trending,
    });
  },

  friendReactToBlog: async (req, res) => {
    const userId = req.user._id;
    const { blogId } = req.params;
    const { reacted } = req.body;

    const allow = ['Liked', 'Angry', 'Loved', 'None'];
    if (!allow.includes(reacted)) {
      throw new ErrorResponse(400, 'Invalid reacted type');
    }

    const found = await blog.findById(blogId);
    if (!found) {
      throw new ErrorResponse(404, 'blog not found');
    }

    const idx = found.whoReact.findIndex(
      (x) => x.user.toString() === userId.toString(),
    );

    if (idx === -1) {
      found.whoReact.push({ user: userId, reacted });
    } else {
      const current = found.whoReact[idx].reacted;
      found.whoReact[idx].reacted = current === reacted ? 'None' : reacted;
    }

    await found.save();

    return res.status(200).json({
      message: 'react updated',
      data: found,
    });
  },

  commentOnBlog: async (req, res) => {
    const userId = req.user._id;
    const { blogId } = req.params;
    const { commentDetail } = req.body;

    if (
      !commentDetail ||
      typeof commentDetail !== 'string' ||
      !commentDetail.trim()
    ) {
      throw new ErrorResponse(400, 'commentDetail is required');
    }

    const found = await blog.findById(blogId);
    if (!found) {
      throw new ErrorResponse(404, 'blog not found');
    }

    found.comment.push({
      commentDetail: commentDetail.trim(),
      userId,
    });

    await found.save();

    return res.status(200).json({
      message: 'comment added',
      data: found,
    });
  },

  editComment: async (req, res) => {
    const userId = req.user._id;
    const { blogId, commentId } = req.params;
    const { commentDetail } = req.body;

    if (
      !commentDetail ||
      typeof commentDetail !== 'string' ||
      !commentDetail.trim()
    ) {
      throw new ErrorResponse(400, 'commentDetail is required');
    }

    const found = await blog.findById(blogId);
    if (!found) {
      throw new ErrorResponse(404, 'blog not found');
    }

    const cmt = found.comment.id(commentId);
    if (!cmt) {
      throw new ErrorResponse(404, 'comment not found');
    }

    if (cmt.userId.toString() !== userId.toString()) {
      throw new ErrorResponse(403, 'not allowed to edit this comment');
    }

    cmt.commentDetail = commentDetail.trim();
    await found.save();

    return res.status(200).json({
      message: 'comment updated',
      data: found,
    });
  },

  deleteComment: async (req, res) => {
    const userId = req.user._id;
    const { blogId, commentId } = req.params;

    const found = await blog.findById(blogId);
    if (!found) {
      throw new ErrorResponse(404, 'blog not found');
    }

    const cmt = found.comment.id(commentId);
    if (!cmt) {
      throw new ErrorResponse(404, 'comment not found');
    }

    if (cmt.userId.toString() !== userId.toString()) {
      throw new ErrorResponse(403, 'not allowed to delete this comment');
    }

    cmt.deleteOne();
    await found.save();

    return res.status(200).json({
      message: 'comment deleted',
      data: found,
    });
  },

  getCommentForOneBlog: async (req, res) => {
    const { blogId } = req.query;

    if (!blogId) {
      throw new ErrorResponse(400, 'blogId is required');
    }

    const findBlog = await blog
      .findById(blogId)
      .select('comment')
      .populate('comment.userId', 'userName avatarPicture');

    if (!findBlog) {
      throw new ErrorResponse(404, 'blog not found');
    }

    return res.status(200).json({
      message: 'all comments for this blog',
      data: findBlog.comment,
    });
  },

  getBlogsByUserId: async (req, res) => {
    const { userId } = req.params;

    const blogs = await blog
      .find({ userId })
      .sort({ createdAt: -1 })
      .populate('userId', 'userName avatarPicture')
      .populate('whoReact.user', 'userName avatarPicture');

    return res.status(200).json({
      message: 'here u go',
      data: blogs,
    });
  },
};
