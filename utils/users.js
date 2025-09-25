// utils/users.js
// Utility functions for managing user data

import { v4 as uuidv4 } from 'uuid';

// In a real application, this would be replaced with a database
// For now, we'll use localStorage on the client and a module variable on the server
let users = [];

// Helper to ensure we're only using localStorage in browser context
const getStorage = () => {
  if (typeof window !== 'undefined') {
    try {
      const storedUsers = localStorage.getItem('tb12_users');
      if (storedUsers) {
        users = JSON.parse(storedUsers);
      }
    } catch (error) {
      console.error('Error loading users from localStorage:', error);
    }
  }
  return users;
};

// Helper to save users to storage
const saveStorage = () => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('tb12_users', JSON.stringify(users));
    } catch (error) {
      console.error('Error saving users to localStorage:', error);
    }
  }
};

// Get user by email
export const getUserByEmail = (email) => {
  const allUsers = getStorage();
  return allUsers.find(user => user.email.toLowerCase() === email.toLowerCase());
};

// Get user by ID
export const getUserById = (id) => {
  const allUsers = getStorage();
  return allUsers.find(user => user.id === id);
};

// Get user by wallet address
export const getUserByWalletAddress = (address) => {
  const allUsers = getStorage();
  return allUsers.find(user => 
    user.wallets && user.wallets.some(w => 
      w.address.toLowerCase() === address.toLowerCase()
    )
  );
};

// Create a new user
export const createUser = (userData) => {
  const allUsers = getStorage();
  
  // Check if email already exists
  if (getUserByEmail(userData.email)) {
    throw new Error('Email already in use');
  }
  
  // Create new user with generated ID
  const newUser = {
    id: uuidv4(),
    created: new Date().toISOString(),
    ...userData
  };
  
  allUsers.push(newUser);
  users = allUsers;
  saveStorage();
  
  // Return user without sensitive info
  const { password, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

// Update user data
export const updateUser = (id, userData) => {
  const allUsers = getStorage();
  const index = allUsers.findIndex(user => user.id === id);
  
  if (index === -1) {
    throw new Error('User not found');
  }
  
  // Don't overwrite these fields directly
  const { id: _, password: __, ...updateData } = userData;
  
  // Update user
  const updatedUser = {
    ...allUsers[index],
    ...updateData
  };
  
  allUsers[index] = updatedUser;
  users = allUsers;
  saveStorage();
  
  // Return user without sensitive info
  const { password, ...userWithoutPassword } = updatedUser;
  return userWithoutPassword;
};

// Link wallet to user
export const linkWalletToUser = (userId, walletData) => {
  const allUsers = getStorage();
  const index = allUsers.findIndex(user => user.id === userId);
  
  if (index === -1) {
    throw new Error('User not found');
  }
  
  // Check if wallet already linked to another user
  const existingWalletUser = getUserByWalletAddress(walletData.address);
  if (existingWalletUser && existingWalletUser.id !== userId) {
    throw new Error('Wallet already linked to another account');
  }
  
  // Add or update wallet
  const user = allUsers[index];
  const wallets = user.wallets || [];
  
  const walletIndex = wallets.findIndex(w => 
    w.address.toLowerCase() === walletData.address.toLowerCase()
  );
  
  if (walletIndex >= 0) {
    wallets[walletIndex] = { ...wallets[walletIndex], ...walletData };
  } else {
    wallets.push(walletData);
  }
  
  // Update user
  user.wallets = wallets;
  allUsers[index] = user;
  users = allUsers;
  saveStorage();
  
  // Return user without sensitive info
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

// Initialize with a test user if none exist
export const initializeUsers = () => {
  const allUsers = getStorage();
  if (allUsers.length === 0) {
    try {
      createUser({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        username: 'testuser',
        emailVerified: true,
        authProvider: 'email'
      });
      console.log('Created test user');
    } catch (error) {
      console.error('Error creating test user:', error);
    }
  }
};