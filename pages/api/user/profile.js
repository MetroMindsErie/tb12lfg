// pages/api/user/profile.js
// API route for managing user profiles

import { getUserById, updateUser } from '../../../utils/users';
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
    
    // Handle GET request - return user profile
    if (req.method === 'GET') {
      const { password, ...userWithoutPassword } = user;
      return res.status(200).json(userWithoutPassword);
    }
    
    // Handle PUT request - update user profile
    if (req.method === 'PUT') {
      const updatedUser = updateUser(user.id, req.body);
      return res.status(200).json(updatedUser);
    }
    
    // If we get here, method not allowed
    res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Profile operation error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    res.status(500).json({ message: error.message || 'An error occurred' });
  }
}