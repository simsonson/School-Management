const Notification = require('../models/Notification');

// @desc    Get notifications for current user
// @route   GET /api/notifications
// @access  Private
exports.getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      $or: [{ recipient: req.user.id }, { role: req.user.role }, { role: 'All' }],
    }).sort({ createdAt: -1 });

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    res.status(200).json({
      success: true,
      unreadCount,
      count: notifications.length,
      data: notifications,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    const allowed =
      !notification.recipient ||
      notification.recipient.toString() === req.user.id.toString() ||
      notification.role === 'All' ||
      notification.role === req.user.role;

    if (!allowed) {
      return res.status(403).json({ success: false, error: 'Not authorized for this notification' });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (err) {
    next(err);
  }
};
