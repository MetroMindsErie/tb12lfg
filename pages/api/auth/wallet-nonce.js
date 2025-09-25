// pages/api/auth/wallet-nonce.js
// API route for getting a nonce for wallet signing

// In production, store nonces in a database
const walletNonces = {};

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { address } = req.query;
  
  if (!address) {
    return res.status(400).json({ message: 'Wallet address is required' });
  }
  
  try {
    // Generate random nonce
    const nonce = Math.floor(Math.random() * 1000000).toString();
    walletNonces[address.toLowerCase()] = nonce;
    
    res.status(200).json({ nonce });
  } catch (error) {
    console.error('Wallet nonce error:', error);
    res.status(500).json({ message: 'Error generating nonce' });
  }
}