const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Get conversation list (unique users the current user has chatted with)
// @route   GET /api/messages/conversations
// @access  Private (Parent, Teacher)
exports.getConversations = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Find all unique users this user has exchanged messages with
    const sent = await Message.aggregate([
      { $match: { sender: userId } },
      { $group: { _id: '$receiver', lastMessage: { $last: '$content' }, lastDate: { $last: '$createdAt' } } }
    ]);

    const received = await Message.aggregate([
      { $match: { receiver: userId } },
      { $group: { _id: '$sender', lastMessage: { $last: '$content' }, lastDate: { $last: '$createdAt' } } }
    ]);

    // Merge conversations
    const convMap = new Map();
    [...sent, ...received].forEach((c) => {
      const key = c._id.toString();
      const existing = convMap.get(key);
      if (!existing || c.lastDate > existing.lastDate) {
        convMap.set(key, c);
      }
    });

    // Get user details and unread counts
    const conversations = [];
    for (const [otherUserId, conv] of convMap) {
      const otherUser = await User.findById(otherUserId).select('name email role');
      const unreadCount = await Message.countDocuments({
        sender: otherUserId,
        receiver: userId,
        isRead: false,
      });

      if (otherUser) {
        conversations.push({
          user: otherUser,
          lastMessage: conv.lastMessage,
          lastDate: conv.lastDate,
          unreadCount,
        });
      }
    }

    // Sort by most recent
    conversations.sort((a, b) => new Date(b.lastDate) - new Date(a.lastDate));

    res.status(200).json({
      success: true,
      data: conversations,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get messages with a specific user
// @route   GET /api/messages/:userId
// @access  Private (Parent, Teacher)
exports.getMessages = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const otherUserId = req.params.userId;

    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate('sender', 'name role')
      .populate('receiver', 'name role');

    // Mark received messages as read
    await Message.updateMany(
      { sender: otherUserId, receiver: userId, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Send a message
// @route   POST /api/messages
// @access  Private (Parent, Teacher)
exports.sendMessage = async (req, res, next) => {
  try {
    const { receiverId, content } = req.body;

    if (!receiverId || !content) {
      return res.status(400).json({ success: false, error: 'Receiver and content are required' });
    }

    // Verify receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ success: false, error: 'Receiver not found' });
    }

    // Enforce: parents can only message teachers & vice versa
    const senderRole = req.user.role;
    const receiverRole = receiver.role;

    const allowed =
      (senderRole === 'Parent' && receiverRole === 'Teacher') ||
      (senderRole === 'Teacher' && receiverRole === 'Parent');

    if (!allowed) {
      return res.status(403).json({
        success: false,
        error: 'Messages can only be sent between parents and teachers',
      });
    }

    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      content,
    });

    const populated = await Message.findById(message._id)
      .populate('sender', 'name role')
      .populate('receiver', 'name role');

    res.status(201).json({
      success: true,
      data: populated,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get contactable users (teachers for parents, parents for teachers)
// @route   GET /api/messages/contacts
// @access  Private (Parent, Teacher)
exports.getContacts = async (req, res, next) => {
  try {
    const role = req.user.role;
    let contacts = [];

    if (role === 'Parent') {
      // Parent can contact teachers of their child's class
      const children = await User.find({
        role: 'Student',
        parentEmail: req.user.email,
      }).select('className');

      const classNames = [...new Set(children.map((c) => c.className).filter(Boolean))];

      if (classNames.length > 0) {
        // Find teachers assigned to those classes
        const TeacherAllocation = require('../models/TeacherAllocation');
        const allocations = await TeacherAllocation.find({
          className: { $in: classNames },
        }).select('teacher');

        const teacherIds = [...new Set(allocations.map((a) => a.teacher.toString()))];
        contacts = await User.find({ _id: { $in: teacherIds }, role: 'Teacher' }).select('name email role');

        // If no allocations found, show all teachers
        if (contacts.length === 0) {
          contacts = await User.find({ role: 'Teacher' }).select('name email role');
        }
      } else {
        // Fallback: show all teachers
        contacts = await User.find({ role: 'Teacher' }).select('name email role');
      }
    } else if (role === 'Teacher') {
      // Teacher can contact parents of students in their classes
      const TeacherAllocation = require('../models/TeacherAllocation');
      const allocations = await TeacherAllocation.find({ teacher: req.user._id }).select('className');
      const classNames = allocations.map((a) => a.className);

      if (classNames.length > 0) {
        const students = await User.find({
          role: 'Student',
          className: { $in: classNames },
          parentEmail: { $exists: true, $ne: '' },
        }).select('parentEmail name className');

        const parentEmails = [...new Set(students.map((s) => s.parentEmail).filter(Boolean))];
        contacts = await User.find({ email: { $in: parentEmails }, role: 'Parent' }).select('name email role');

        if (contacts.length === 0) {
          contacts = await User.find({ role: 'Parent' }).select('name email role');
        }
      } else {
        contacts = await User.find({ role: 'Parent' }).select('name email role');
      }
    }

    res.status(200).json({
      success: true,
      data: contacts,
    });
  } catch (err) {
    next(err);
  }
};
