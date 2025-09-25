// utils/secure-wallet.js
// Simple wallet operations with minimal error points

/**
 * Simple connection to MetaMask wallet
 * @returns {Promise<{address: string, chainId: string}>} Connected wallet data
 */
export async function secureConnect() {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('No wallet detected. Please install MetaMask.');
  }

  console.log("Simple wallet connection request...");
  
  try {
    // Request accounts with the simplest method
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });
    
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found');
    }
    
    const address = accounts[0];
    console.log("Connected to address:", address);
    
    return {
      address,
      provider: window.ethereum,
      connectedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error("Wallet connection error:", error);
    throw error;
  }
}

/**
 * Get the current MetaMask account if already connected
 * @returns {Promise<string|null>} The current account address or null
 */
export async function getCurrentAccount() {
  if (typeof window === 'undefined' || !window.ethereum) {
    return null;
  }
  
  try {
    const accounts = await window.ethereum.request({
      method: 'eth_accounts'
    });
    
    return accounts && accounts.length > 0 ? accounts[0] : null;
  } catch (error) {
    console.error("Error getting current account:", error);
    return null;
  }
}