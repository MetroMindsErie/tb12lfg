// utils/wallet.js
// Utility functions for wallet interactions

/**
 * Signs a message with the provided wallet provider and address
 * @param {object} provider - The wallet provider (e.g. window.ethereum)
 * @param {string} address - The wallet address
 * @param {string} message - The message to sign
 * @returns {Promise<string>} - The signature
 */
export async function signMessage(provider, address, message) {
  console.log("Sign message called with:", { provider: !!provider, address, message });
  
  if (!provider) {
    throw new Error('No wallet provider available');
  }
  
  if (!address) {
    throw new Error('Wallet address is required for signing');
  }

  // Add a timestamp and domain to the message for security
  const secureMessage = `${message}\nDomain: ${window.location.hostname}`;
  console.log("Secure message to sign:", secureMessage);

  try {
    // Try the personal_sign method (most common)
    console.log("Attempting personal_sign with address:", address);
    return await provider.request({
      method: 'personal_sign',
      params: [secureMessage, address]
    });
  } catch (error) {
    console.error('personal_sign failed, trying eth_sign:', error);
    
    // Fall back to eth_sign if personal_sign fails
    // Note: eth_sign is considered less secure but more widely supported
    try {
      return await provider.request({
        method: 'eth_sign',
        params: [address, secureMessage]
      });
    } catch (err) {
      console.error('eth_sign also failed:', err);
      throw new Error('Failed to sign message with wallet: ' + (err.message || ''));
    }
  }
}

/**
 * Connects to a wallet and returns the account info
 * @param {object} provider - The wallet provider (e.g. window.ethereum)
 * @returns {Promise<object>} - The wallet data
 */
export async function connectWallet(provider) {
  if (!provider) {
    throw new Error('No wallet provider available');
  }

  try {
    // Request account access
    const accounts = await provider.request({
      method: 'eth_requestAccounts'
    });

    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found');
    }

    const address = accounts[0];

    // Get chain ID
    let chainId;
    try {
      chainId = await provider.request({
        method: 'eth_chainId'
      });
    } catch (err) {
      console.warn('Could not get chain ID:', err);
      chainId = 'unknown';
    }

    return {
      address,
      chainId,
      provider,
      connectedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Failed to connect wallet:', error);
    throw error;
  }
}