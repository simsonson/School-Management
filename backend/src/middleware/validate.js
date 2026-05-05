const buildError = (message) => ({ success: false, error: message });

exports.requireFields = (fields) => (req, res, next) => {
  const missing = fields.filter((field) => {
    const value = req.body[field];
    return value === undefined || value === null || value === '';
  });

  if (missing.length > 0) {
    return res.status(400).json(buildError(`Missing required field(s): ${missing.join(', ')}`));
  }

  next();
};

exports.validateRole = (allowedRoles) => (req, res, next) => {
  const { role } = req.body;
  if (role && !allowedRoles.includes(role)) {
    return res.status(400).json(buildError(`Invalid role. Allowed: ${allowedRoles.join(', ')}`));
  }
  next();
};

exports.validateAttendanceStatus = (req, res, next) => {
  const allowedStatus = ['Present', 'Absent', 'Late', 'Excused'];
  if (req.body.status && !allowedStatus.includes(req.body.status)) {
    return res.status(400).json(buildError(`Invalid attendance status. Allowed: ${allowedStatus.join(', ')}`));
  }
  next();
};
