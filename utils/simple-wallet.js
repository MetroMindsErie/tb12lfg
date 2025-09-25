// utils/simple-wallet.js
// Ultra-simplified wallet connection utility with no dependencies

/**
 * Connect to MetaMask with minimal code to avoid errors
 * @returns {Promise<{address: string}>} The connected wallet address
 */
export async function connectMetaMaskSimple() {
  return new Promise((resolve, reject) => {
    // Check for ethereum provider
    if (!window.ethereum) {
      return reject(new Error("MetaMask not detected. Please install MetaMask."));
    }

    // Simple timeout to prevent hanging UI
    const timeout = setTimeout(() => {
      reject(new Error("Connection request timed out. Please try again."));
    }, 30000);

    try {
      // Request accounts - simplest possible implementation
      window.ethereum.request({ 
        method: 'eth_requestAccounts'
      })
      .then(accounts => {
        clearTimeout(timeout);
        if (accounts && accounts.length > 0) {
          console.log("Simple connection successful:", accounts[0]);
          resolve({
            address: accounts[0],
            provider: window.ethereum
          });
        } else {
          reject(new Error("No accounts found or access denied."));
        }
      })
      .catch(err => {
        clearTimeout(timeout);
        console.error("Simple connection error:", err);
        reject(err);
      });
    } catch (err) {
      clearTimeout(timeout);
      console.error("Unexpected error:", err);
      reject(err);
    }
  });
}

/**
 * Get current connected account if any
 * @returns {Promise<string|null>} The connected account or null
 */
export async function getCurrentAccount() {
  if (!window.ethereum) return null;
  
  try {
    const accounts = await window.ethereum.request({
      method: 'eth_accounts' // This doesn't prompt, just gets currently connected accounts
    });
    
    return accounts && accounts.length > 0 ? accounts[0] : null;
  } catch (err) {
    console.error("Error getting current account:", err);
    return null;
  }
}