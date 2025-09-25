// pages/api/auth/user-created.js
// Webhook handler for user creation events from Supabase

import { createProfile } from '../../../lib/db';

// This endpoint should be set up as a webhook in Supabase
// For auth.user.created events

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Verify webhook secret if you have one
  // const webhookSecret = process.env.SUPABASE_WEBHOOK_SECRET;
  // if (req.headers['x-supabase-webhook-secret'] !== webhookSecret) {
  //   return res.status(401).json({ message: 'Unauthorized' });
  // }

  try {
    const { record } = req.body;
    
    if (!record || !record.id) {
      return res.status(400).json({ message: 'Invalid webhook payload' });
    }
    
    // Create a profile for the user
    const { profile, error } = await createProfile(record);
    
    if (error) {
      console.error('Error creating profile from webhook:', error);
      return res.status(500).json({ message: 'Failed to create profile' });
    }
    
    res.status(200).json({ success: true, profile });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ message: 'An error occurred' });
  }
}