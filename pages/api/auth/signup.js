// pages/api/auth/signup.js
// API route for user signup

import { createUser, getUserByEmail, initializeUsers } from '../../../utils/users';
import jwt from 'jsonwebtoken';

// Initialize JWT secret from environment variable or use a default for development
const JWT_SECRET = process.env.JWT_SECRET || 'tb12_development_secret';

// Initialize some test users if needed
initializeUsers();

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;
    
    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Check if user already exists
    const existingUser = getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }
    
    // Create user (in a production app, you would hash the password)
    const user = createUser({
      email,
      password, // In production: use bcrypt to hash password
      emailVerified: false,
      authProvider: 'email'
    });
    
    // Generate a JWT for the new user
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Return success with user data (excluding password)
    res.status(200).json({
      message: 'User created successfully',
      user,
      token
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: error.message || 'An error occurred during signup' });
  }
}