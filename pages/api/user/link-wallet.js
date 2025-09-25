// pages/api/user/link-wallet.js
// API route for linking wallets to user accounts

import { getUserById, linkWalletToUser } from '../../../utils/users';
import jwt from 'jsonwebtoken';
import { ethers } from 'ethers';

// Initialize JWT secret from environment variable or use a default for development
const JWT_SECRET = process.env.JWT_SECRET || 'tb12_development_secret';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

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
    
    // Get wallet data from request
    const { walletAddress, signedMessage, signature } = req.body;
    
    if (!walletAddress || !signedMessage || !signature) {
      return res.status(400).json({ 
        message: 'Wallet address, signed message, and signature are required' 
      });
    }
    
    // Verify the signature
    const recoveredAddress = ethers.utils.verifyMessage(signedMessage, signature);
    
    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return res.status(401).json({ message: 'Invalid signature' });
    }
    
    // Link wallet to user
    const updatedUser = linkWalletToUser(user.id, {
      address: walletAddress,
      connectedAt: new Date().toISOString(),
      walletName: req.body.walletName || 'Web3 Wallet',
      chainId: req.body.chainId || 'unknown'
    });
    
    res.status(200).json({
      success: true,
      user: updatedUser
    });
  } catch (error) {
    console.error('Link wallet error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    res.status(500).json({ message: error.message || 'An error occurred linking wallet' });
  }
}