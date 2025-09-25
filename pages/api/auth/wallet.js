// pages/api/auth/wallet.js
// API route for wallet-based authentication

import { getUserByWalletAddress, createUser } from '../../../utils/users';
import jwt from 'jsonwebtoken';
import { ethers } from 'ethers';

// Initialize JWT secret from environment variable or use a default for development
const JWT_SECRET = process.env.JWT_SECRET || 'tb12_development_secret';

// Wallet nonces for signing (in production, store these in a database)
const walletNonces = {};

export default function handler(req, res) {
  if (req.method === 'GET') {
    // Generate a new nonce for signing
    const { address } = req.query;
    
    if (!address) {
      return res.status(400).json({ message: 'Wallet address is required' });
    }
    
    // Generate random nonce
    const nonce = Math.floor(Math.random() * 1000000).toString();
    walletNonces[address.toLowerCase()] = nonce;
    
    return res.status(200).json({ nonce });
  }
  
  if (req.method === 'POST') {
    // Authenticate with signed message
    const { walletAddress, signedMessage, signature } = req.body;
    
    if (!walletAddress || !signedMessage || !signature) {
      return res.status(400).json({ 
        message: 'Wallet address, signed message, and signature are required' 
      });
    }
    
    try {
      // Verify the signature
      const recoveredAddress = ethers.utils.verifyMessage(signedMessage, signature);
      
      if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
        return res.status(401).json({ message: 'Invalid signature' });
      }
      
      // Get or create user
      let user = getUserByWalletAddress(walletAddress);
      
      if (!user) {
        // Create new user with wallet
        user = createUser({
          email: `wallet_${walletAddress.toLowerCase().substring(0, 8)}@tb12lfg.com`,
          password: Math.random().toString(36).substring(2), // random password
          authProvider: 'wallet',
          emailVerified: true, // wallet auth doesn't need email verification
          wallets: [
            {
              address: walletAddress,
              chainId: 'unknown', // Can be updated later
              walletName: 'Web3 Wallet'
            }
          ]
        });
      }
      
      // Generate JWT
      const token = jwt.sign(
        { id: user.id, wallet: walletAddress },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      // Clear the nonce
      delete walletNonces[walletAddress.toLowerCase()];
      
      res.status(200).json({
        user,
        token
      });
    } catch (error) {
      console.error('Wallet auth error:', error);
      res.status(500).json({ message: error.message || 'Error during wallet authentication' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}