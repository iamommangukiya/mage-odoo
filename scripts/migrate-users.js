const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

// Import User model
const User = require('../lib/models/User').default;

async function migrateUsers() {
  try {
    console.log('Starting user migration...');
    
    // Find all users
    const users = await User.find({});
    console.log(`Found ${users.length} users to migrate`);
    
    let updatedCount = 0;
    
    for (const user of users) {
      const updates = {};
      
      // Add missing fields if they don't exist
      if (user.total_swaps === undefined) {
        updates.total_swaps = user.swaps || 0;
      }
      
      if (user.completed_swaps === undefined) {
        updates.completed_swaps = 0; // Default to 0
      }
      
      if (user.joined_date === undefined) {
        updates.joined_date = new Date(); // Default to now
      }
      
      if (user.reviews === undefined) {
        updates.reviews = [];
      }
      
      // Update user if there are changes
      if (Object.keys(updates).length > 0) {
        await User.findByIdAndUpdate(user._id, updates);
        updatedCount++;
        console.log(`Updated user: ${user.email}`);
      }
    }
    
    console.log(`Migration completed! Updated ${updatedCount} users.`);
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run migration
migrateUsers(); 