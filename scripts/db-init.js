// scripts/db-init.js
// Initialize database tables if they don't exist
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function initDatabase() {
  console.log('Initializing database tables...');

  try {
    // Check if tables exist
    const { data: tables, error: tablesError } = await supabase.rpc('get_tables');
    
    if (tablesError) {
      console.error('Error checking tables:', tablesError);
      return;
    }
    
    const existingTables = tables.map(table => table.name);
    console.log('Existing tables:', existingTables);
    
    // Create profiles table if it doesn't exist
    if (!existingTables.includes('profiles')) {
      console.log('Creating profiles table...');
      
      const { error } = await supabase.query(`
        CREATE TABLE profiles (
          id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
          username TEXT UNIQUE,
          email TEXT UNIQUE,
          avatar_url TEXT,
          wallet_address TEXT,
          has_nft BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
        );

        ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Public profiles are viewable by everyone." 
          ON profiles FOR SELECT 
          USING (true);

        CREATE POLICY "Users can insert their own profile." 
          ON profiles FOR INSERT 
          WITH CHECK (auth.uid() = id);

        CREATE POLICY "Users can update their own profile." 
          ON profiles FOR UPDATE 
          USING (auth.uid() = id);
      `);
      
      if (error) {
        console.error('Error creating profiles table:', error);
      } else {
        console.log('Profiles table created successfully!');
      }
    }
    
    // Create challenges table if it doesn't exist
    if (!existingTables.includes('challenges')) {
      console.log('Creating challenges table...');
      
      const { error } = await supabase.query(`
        CREATE TABLE challenges (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          title TEXT NOT NULL,
          description TEXT,
          points INTEGER DEFAULT 0,
          start_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
          end_date TIMESTAMP WITH TIME ZONE,
          status TEXT DEFAULT 'active',
          image_url TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
        );

        ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Challenges are viewable by everyone." 
          ON challenges FOR SELECT 
          USING (true);
      `);
      
      if (error) {
        console.error('Error creating challenges table:', error);
      } else {
        console.log('Challenges table created successfully!');
      }
    }
    
    // Create nfts table if it doesn't exist
    if (!existingTables.includes('nfts')) {
      console.log('Creating nfts table...');
      
      const { error } = await supabase.query(`
        CREATE TABLE nfts (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name TEXT NOT NULL,
          description TEXT,
          image_url TEXT,
          token_id TEXT,
          contract_address TEXT,
          owner_id UUID REFERENCES auth.users(id),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
        );

        ALTER TABLE nfts ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "NFTs are viewable by everyone." 
          ON nfts FOR SELECT 
          USING (true);
      `);
      
      if (error) {
        console.error('Error creating nfts table:', error);
      } else {
        console.log('NFTs table created successfully!');
      }
    }
    
    // Create merchandise table if it doesn't exist
    if (!existingTables.includes('merchandise')) {
      console.log('Creating merchandise table...');
      
      const { error } = await supabase.query(`
        CREATE TABLE merchandise (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name TEXT NOT NULL,
          description TEXT,
          price NUMERIC(10, 2) NOT NULL,
          image_url TEXT,
          nft_discount BOOLEAN DEFAULT FALSE,
          discount_percentage INTEGER DEFAULT 0,
          in_stock BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
        );

        ALTER TABLE merchandise ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Merchandise is viewable by everyone." 
          ON merchandise FOR SELECT 
          USING (true);
      `);
      
      if (error) {
        console.error('Error creating merchandise table:', error);
      } else {
        console.log('Merchandise table created successfully!');
      }
    }
    
    console.log('Database initialization completed!');
    
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Run the initialization
initDatabase();