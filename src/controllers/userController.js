const user = require('../models/user');
const userModel = require('../models/user');
const { signAccessToken } = require('../utils/jwt');

let bcrypt;
try {
  bcrypt = require('bcrypt');
} catch (e) {
  bcrypt = null;
}

module.exports = {
  register: async (req, res) => {
    try {
      const body = req.body;

      const email = (body.email || '').trim().toLowerCase();
      const userName = (body.userName || '').trim();
      const password = body.password;

      if (!email || !userName || !password) {
        return res.status(400).json({
          success: false,
          message: 'email, userName and password are required',
        });
      }

      const existing = await userModel.findOne({
        $or: [{ email }, { userName }],
      });

      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'Account already exists',
        });
      }

      // Hash password if bcrypt exists
      if (bcrypt) {
        body.password = await bcrypt.hash(password, 10);
      }

      // Ensure stored email is normalized
      body.email = email;
      body.userName = userName;

      const createdUser = await userModel.create(body);

      // Create JWT + cookie + return token
      const token = signAccessToken({
        userId: createdUser._id.toString(),
        email: createdUser.email,
      });

      res.cookie('access_token', token, {
        httpOnly: true,
        secure: false, // set true in production (HTTPS)
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      return res.status(201).json({
        success: true,
        message: 'Register success',
        token,
        userData: {
          _id: createdUser._id,
          email: createdUser.email,
          userName: createdUser.userName,
          phoneNumber: createdUser.phoneNumber || '',
          role: createdUser.role,
        },
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  login: async (req, res) => {
    try {
      const emailOrUserNameRaw = (
        req.body.email ||
        req.body.userName ||
        ''
      ).trim();
      const password = req.body.password;

      if (!emailOrUserNameRaw || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email/username and password are required',
        });
      }

      const emailOrUserName = emailOrUserNameRaw.includes('@')
        ? emailOrUserNameRaw.toLowerCase()
        : emailOrUserNameRaw;

      const user = await userModel.findOne({
        $or: [{ email: emailOrUserName }, { userName: emailOrUserName }],
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Wrong email/username or password',
        });
      }

      const isMatch = bcrypt
        ? await bcrypt.compare(password, user.password)
        : user.password === password;

      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Wrong email/username or password',
        });
      }

      const token = signAccessToken({
        userId: user._id.toString(),
        email: user.email,
      });

      res.cookie('access_token', token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000,
      });

      return res.status(200).json({
        success: true,
        message: 'Login success',
        token,
        userData: {
          _id: user._id,
          email: user.email,
          userName: user.userName,
          phoneNumber: user.phoneNumber || '',
          role: user.role,
        },
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  getAccounts: async (req, res) => {
    try {
      const users = await userModel.find().select('-password');
      return res.status(200).json({
        success: true,
        data: users,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  getOneAccount: async (req, res) => {
    try {
      const { userName } = req.params;

      const user = await userModel.findOne({ userName }).select('-password');

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: 'User not found' });
      }

      return res.status(200).json({ success: true, data: user });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  updateAccount: async (req, res) => {
    try {
      const id = req.params.id;

      const updateData = {};

      if (req.body.email)
        updateData.email = String(req.body.email).trim().toLowerCase();
      if (req.body.userName)
        updateData.userName = String(req.body.userName).trim();
      // allow "username" alias -> map to userName
      if (req.body.username)
        updateData.userName = String(req.body.username).trim();

      if (req.body.phoneNumber !== undefined)
        updateData.phoneNumber = req.body.phoneNumber;
      if (req.body.role) updateData.role = req.body.role;

      if (req.body.password) {
        updateData.password = bcrypt
          ? await bcrypt.hash(req.body.password, 10)
          : req.body.password;
      }

      const updated = await userModel
        .findByIdAndUpdate(id, updateData, { new: true })
        .select('-password');

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Updated',
        userData: updated,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  changePassword: async (req, res) => {
    try {
      const userId = req.user._id;
      const { password: oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        return res.status(400).json({
          message: 'Old password and new password are required',
        });
      }

      const acc = await user.findById(userId);
      if (!acc) {
        return res.status(404).json({ message: 'User not found' });
      }

      const isMatch = await bcrypt.compare(oldPassword, acc.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Old password is incorrect' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await user.findByIdAndUpdate(
        userId,
        { password: hashedPassword },
        { new: true },
      );

      return res.status(200).json({
        message: 'Password changed successfully',
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Server error',
        error: error.message,
      });
    }
  },

  deleteAccount: async (req, res) => {
    try {
      const id = req.params.id;
      const deleted = await userModel.findByIdAndDelete(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'User deleted',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  changeProfilePic: async (req, res) => {
    try {
      const userId = req.user._id;

      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const picPath = `/share/${req.file.filename}`;

      const updatedUser = await user.findByIdAndUpdate(
        userId,
        { avatarPicture: picPath },
        { new: true, select: '-password' },
      );

      return res.status(200).json({
        message: 'Profile picture updated',
        data: updatedUser,
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },
  findUserById: async (req, res) => {
    try {
      const { id } = req.params;
      const data = await user.findById(id);

      if (!data) {
        return res.status(400).json({ message: 'failed' });
      }

      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },
};
