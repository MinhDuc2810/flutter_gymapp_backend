const jwt = require('jsonwebtoken');

// Middleware xác thực token (authentication)
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: Token missing' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretKey');
    req.user = decoded; // { id, role }
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Forbidden: Invalid token' });
  }
};

// Middleware phân quyền (authorization)
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: Admin only' });
  }
  next();
};

const isPT = (req, res, next) => {
  if (req.user.role !== 'pt') {
    return res.status(403).json({ message: 'Access denied: PT only' });
  }
  next();
};

const isStudent = (req, res, next) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ message: 'Access denied: Student only' });
  }
  next();
};

module.exports = {
  verifyToken,
  isAdmin,
  isPT,
  isStudent
};
