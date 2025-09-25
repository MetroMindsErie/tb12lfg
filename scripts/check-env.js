// scripts/check-env.js
const fs = require('fs');
const path = require('path');

console.log('\nChecking TB12.LFG environment setup...\n');

// Check for .env.local file
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  console.log('✅ .env.local file found');
  
  // Read the file and check for required variables
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (envContent.includes('NEXT_PUBLIC_SUPABASE_URL') && 
      envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY')) {
    console.log('✅ Supabase environment variables found');
  } else {
    console.log('❌ Missing required Supabase environment variables');
  }
} else {
  console.log('❌ .env.local file not found. Please create it with your Supabase credentials.');
}

// Check for required directories
const requiredDirs = ['components', 'lib', 'pages', 'public', 'styles'];
requiredDirs.forEach(dir => {
  const dirPath = path.join(process.cwd(), dir);
  if (fs.existsSync(dirPath)) {
    console.log(`✅ ${dir} directory found`);
  } else {
    console.log(`❌ ${dir} directory not found`);
  }
});

// Check for required image directory
const imagesPath = path.join(process.cwd(), 'public/images');
if (fs.existsSync(imagesPath)) {
  console.log('✅ public/images directory found');
  
  // Count the number of files
  const imageFiles = fs.readdirSync(imagesPath);
  console.log(`   Found ${imageFiles.length} files in images directory`);
} else {
  console.log('❌ public/images directory not found');
}

console.log('\nEnvironment check complete!');
console.log('\nNext steps:');
console.log('1. Run "npm run setup" to create placeholder image files');
console.log('2. Set up your Supabase database tables using supabase/schema.sql');
console.log('3. Run "npm run dev" to start the development server');
console.log('\nRefer to GETTING_STARTED.md for detailed instructions.\n');