// pages/api/auth/session.js
// API route for validating user sessions

import { getUserById } from '../../../utils/users';
import jwt from 'jsonwebtoken';

// Initialize JWT secret from environment variable or use a default for development
const JWT_SECRET = process.env.JWT_SECRET || 'tb12_development_secret';

export default function handler(req, res) {
  // Check for auth header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Extract token
  const token = authHeader.split(' ')[1];
  
  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get user
    const user = getUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Return user data without password
    const { password, ...userWithoutPassword } = user;
    
    res.status(200).json({
      user: userWithoutPassword,
      token // Return the same token for now
    });
  } catch (error) {
    console.error('Session validation error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    res.status(500).json({ message: 'An error occurred validating your session' });
  }
}