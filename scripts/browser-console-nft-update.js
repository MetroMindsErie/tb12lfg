/**
 * Browser Console Snippet for Updating an NFT Image
 * 
 * Instructions:
 * 1. Copy this entire script
 * 2. Open your website in a browser
 * 3. Open developer tools (F12 or right-click > Inspect)
 * 4. Go to Console tab
 * 5. Paste this script
 * 6. Update the parameters (nftId, userId, newImageUrl)
 * 7. Press Enter to execute
 */

// Update these values with your actual data
const nftId = 1; // The NFT ID (number)
const userId = "your-user-uuid"; // The user's UUID
const newImageUrl = "storage/nft-images/your-image.png"; // New image URL

// Function to update the NFT image
async function updateNftImageInBrowser() {
  try {
    console.log(`Updating NFT ${nftId} for user ${userId}...`);
    
    // First update the nfts table
    const nftResponse = await fetch('/api/admin/update-nft', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      // Using query params for simplicity in this example
      // In production, you'd want to use a POST request with body data
    });
    
    if (!nftResponse.ok) {
      const errorData = await nftResponse.json();
      console.error('Error:', errorData);
      return;
    }
    
    const result = await nftResponse.json();
    console.log('Result:', result);
    
    if (result.success) {
      console.log('✅ NFT image updated successfully!');
    } else {
      console.error('❌ Failed to update NFT image:', result.error);
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Execute the function
updateNftImageInBrowser();