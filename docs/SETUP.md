# Setup Guide - Apex Collector

This guide will help you get the project up and running on your local machine.

## Prerequisites

- **Node.js**: Version 18 or higher
- **npm**: Version 9 or higher
- **Supabase Account**: You'll need a Supabase project for database and storage

## 1. Clone & Install

```bash
# Install dependencies
npm install
```

## 2. Environment Variables

Create a `.env.local` file in the root directory by copying `.env.example`:

```bash
cp .env.example .env.local
```

Fill in your Supabase credentials:
- `NEXT_PUBLIC_SUPABASE_URL`: Your project URL from Settings > API
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your anon public key from Settings > API

## 3. Supabase Setup

### Database
Run the migrations found in (future) `supabase/migrations` or set up the following tables:
- `cards`: Storage for all vehicles and circuits
- `user_cards`: Mapping of cards owned by users
- `achievements`: Definitions for game achievements

### Storage
Create a public bucket named **`assets`** with the following directories:
- `cards/vehicle/`: Vehicle card images
- `cards/circuit/`: Circuit images
- `icons/`: UI icons (svg)
- `logos/brand/`: Manufacturer logos
- `placeholders/`: Fallback images

Refer to `SUPABASE_STORAGE_STRUCTURE.md` for full details.

## 4. Run Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## 5. Deployment

The project is optimized for Vercel. Connect your repository to Vercel and ensure you add the same environment variables in the Vercel Dashboard.

---

### Common Issues

**Images not loading?**
Check your `next.config.mjs`. Ensure your Supabase project hostname is allowed in `remotePatterns`.

**Supabase errors?**
Ensure your RLSPolicies allow reading from the `cards` table.
