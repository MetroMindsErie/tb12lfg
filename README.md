# TB12.LFG - Web3 Fan Community App

A Next.js web application for a Web3 + fan community app called TB12.LFG. The app integrates Supabase for authentication and data, and Web3 for NFT minting. It features a modern, mobile-friendly design with React functional components and TailwindCSS.

## Features

- Landing page with hero section and feature showcase
- User authentication with Supabase
- Dashboard displaying user profile and NFT status
- NFT minting functionality with MetaMask integration
- Merchandise store with special perks for NFT holders
- Responsive design that works on all devices

## Tech Stack

- Next.js (Page Router)
- React (Functional Components)
- Supabase (Authentication & Database)
- Web3 (NFT Minting)
- TailwindCSS (Styling)

## Getting Started

### Prerequisites

- Node.js 14.x or higher
- npm or yarn
- A Supabase account and project
- MetaMask extension (for Web3 functionality)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd tb12lfg
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Set up Supabase:

Create the following tables in your Supabase project:

- `profiles`: For user profile information
  - `id`: UUID (references auth.users.id)
  - `username`: Text
  - `email`: Text
  - `avatar_url`: Text
  - `wallet_address`: Text
  - `has_nft`: Boolean
  - `created_at`: Timestamp

- `nfts`: For NFT data
  - `id`: UUID
  - `user_id`: UUID (references profiles.id)
  - `name`: Text
  - `description`: Text
  - `image_url`: Text
  - `token_id`: Text
  - `owner_address`: Text
  - `transaction_hash`: Text
  - `created_at`: Timestamp

- `merchandise`: For merchandise items
  - `id`: UUID
  - `name`: Text
  - `description`: Text
  - `price`: Float
  - `image_url`: Text
  - `category`: Text
  - `nftDiscount`: Integer
  - `nftPerks`: Boolean
  - `earlyAccess`: Boolean
  - `in_stock`: Boolean
  - `created_at`: Timestamp

- `challenges`: For fan challenges
  - `id`: UUID
  - `title`: Text
  - `description`: Text
  - `start_date`: Timestamp
  - `end_date`: Timestamp
  - `status`: Text
  - `participants`: Integer
  - `created_at`: Timestamp

5. Run the development server:

```bash
npm run dev
# or
yarn dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
tb12lfg/
├── components/      # Reusable React components
├── lib/             # Utility functions and API clients
├── pages/           # Next.js pages
├── public/          # Static files
├── styles/          # Global CSS and styles
├── .env.local       # Environment variables
└── next.config.js   # Next.js configuration
```

## Deployment

This project can be deployed using Vercel, Netlify, or any other hosting service that supports Next.js.

## License

This project is licensed under the MIT License.