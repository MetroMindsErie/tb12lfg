// lib/web3.js
// This file handles Web3 functionality including wallet connection and NFT minting

// Function to connect to MetaMask wallet
export const connectWallet = async () => {
  if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
    try {
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      return {
        success: true,
        address: accounts[0],
        message: 'Wallet connected successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error connecting to wallet: ' + error.message,
      };
    }
  } else {
    return {
      success: false,
      message: 'MetaMask is not installed. Please install MetaMask to continue.',
    };
  }
};

// Function placeholder for minting an NFT
export const mintNFT = async (userAddress) => {
  // This is a placeholder for the actual NFT minting functionality
  // In a real implementation, this would interact with a smart contract
  
  try {
    // Simulating the minting process with a delay
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // Return successful response
    return {
      success: true,
      transactionHash: '0x' + Array(64).fill(0).map(() => 
        Math.floor(Math.random() * 16).toString(16)).join(''),
      message: 'NFT minted successfully',
    };
  } catch (error) {
    return {
      success: false,
      message: 'Error minting NFT: ' + error.message,
    };
  }
};

// Function to check if user has connected wallet
/**
 * Check if a wallet is connected
 * @returns {Promise<boolean>} - True if wallet is connected
 */
export const checkWalletConnection = async () => {
  // Add a safety mechanism for server-side rendering
  if (typeof window === 'undefined') {
    console.log('Running on server, skipping wallet check');
    return false;
  }
  
  try {
    // Check if MetaMask is available
    if (!window.ethereum) {
      console.log('MetaMask not available');
      return false;
    }

    // Safely handle errors with MetaMask
    try {
      // Use a timeout to prevent hanging if MetaMask is installed but not responding
      const accountsPromise = new Promise(async (resolve, reject) => {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          resolve(accounts);
        } catch (error) {
          reject(error);
        }
      });
      
      // Set a timeout of 1 second to avoid blocking the UI
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Wallet connection check timed out')), 1000);
      });
      
      // Race the promises
      const accounts = await Promise.race([accountsPromise, timeoutPromise]);
      return accounts && accounts.length > 0;
    } catch (requestError) {
      console.log('MetaMask access error:', requestError.message);
      return false;
    }
  } catch (error) {
    console.log('Error checking wallet connection:', error.message);
    return false;
  }
};