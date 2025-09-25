// utils/wagmi-utils.js
// Utility functions for wagmi wallet interactions

import { signMessage } from 'wagmi/actions';

/**
 * Signs a message using wagmi's signMessage function
 * @param {string} message - The message to sign
 * @returns {Promise<string>} - The signature
 */
export async function signMessageWithWagmi(message) {
  try {
    // This uses wagmi's signMessage action which handles all the edge cases
    const signature = await signMessage({ message });
    console.log('Message signed:', message);
    console.log('Signature:', signature);
    return signature;
  } catch (error) {
    console.error('Error signing message:', error);
    throw error;
  }
}

/**
 * Creates a secure message to sign with domain info and timestamp
 * @param {string} address - The wallet address
 * @param {string} userId - The user ID
 * @param {string} action - The action being performed
 * @returns {string} - A formatted message to sign
 */
export function createSecureMessage(address, userId, action = 'link') {
  const timestamp = Date.now();
  const nonce = Math.floor(Math.random() * 1000000).toString();
  const domain = typeof window !== 'undefined' ? window.location.hostname : 'tb12.lfg';
  
  return `TB12.LFG Wallet ${action.charAt(0).toUpperCase() + action.slice(1)} Request
Address: ${address}
User ID: ${userId}
Domain: ${domain}
Timestamp: ${timestamp}
Nonce: ${nonce}`;
}