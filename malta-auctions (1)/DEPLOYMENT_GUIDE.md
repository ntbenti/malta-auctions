# MaltaGovAuctions MVP Deployment Guide

This guide will walk you through deploying the MaltaGovAuctions MVP application to Cloudflare Pages with no coding experience required. The application aggregates government-seized assets and distressed property sales from various sources in Malta.

## Prerequisites

Before you begin, you'll need:

1. A Cloudflare account (free tier is sufficient)
2. A GitHub account (free tier is sufficient)
3. A computer with internet access

No coding experience is required to follow this guide.

## Step 1: Create a GitHub Account (if you don't have one)

1. Go to [GitHub.com](https://github.com)
2. Click "Sign up" and follow the instructions to create a free account
3. Verify your email address when prompted

## Step 2: Create a Cloudflare Account (if you don't have one)

1. Go to [Cloudflare.com](https://cloudflare.com)
2. Click "Sign up" and follow the instructions to create a free account
3. Verify your email address when prompted

## Step 3: Fork the MaltaGovAuctions Repository

1. Go to the MaltaGovAuctions GitHub repository (URL will be provided separately)
2. Click the "Fork" button in the top-right corner
3. This creates a copy of the repository in your GitHub account

## Step 4: Set Up Cloudflare Pages

1. Log in to your Cloudflare account
2. Click on "Pages" in the left sidebar
3. Click "Create a project"
4. Select "Connect to Git"
5. Connect your GitHub account when prompted
6. Select the "MaltaGovAuctions" repository you forked in Step 3
7. Click "Begin setup"

## Step 5: Configure Your Cloudflare Pages Project

1. In the "Set up builds and deployments" section:
   - Project name: `maltagovauctions` (or any name you prefer)
   - Production branch: `main`
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: (leave blank)

2. Click "Save and Deploy"
3. Wait for the initial deployment to complete (this may take a few minutes)

## Step 6: Create a Cloudflare D1 Database

1. In your Cloudflare dashboard, click on "Workers & Pages" in the left sidebar
2. Click on "D1" under the "Storage" section
3. Click "Create database"
4. Name your database `maltagovauctions`
5. Choose a location close to your target audience (e.g., "Europe" for Malta)
6. Click "Create database"
7. Once created, note the Database ID (you'll need this later)

## Step 7: Initialize the Database Schema

1. In your Cloudflare dashboard, navigate to your newly created D1 database
2. Click on the "Query" tab
3. Copy and paste the following SQL schema into the query editor:

```sql
-- Create auction_assets table
CREATE TABLE IF NOT EXISTS auction_assets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL CHECK (type IN ('real_estate', 'vessel', 'currency', 'vehicle')),
  seizure_reason TEXT NOT NULL CHECK (seizure_reason IN ('sanctions', 'debt', 'contraband')),
  un_sanctions_compliance BOOLEAN NOT NULL DEFAULT 1,
  local_court_order TEXT,
  contraband_type TEXT CHECK (contraband_type IN ('drugs', 'weapons', 'currency')),
  imo_number TEXT,
  arrest_warrant_id TEXT,
  description TEXT NOT NULL,
  debt_amount TEXT,
  value TEXT,
  origin TEXT,
  source TEXT NOT NULL,
  date_added TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create asset_serials table for currency serial numbers
CREATE TABLE IF NOT EXISTS asset_serials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  asset_id INTEGER NOT NULL,
  serial_number TEXT NOT NULL,
  FOREIGN KEY (asset_id) REFERENCES auction_assets(id) ON DELETE CASCADE
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_assets_type ON auction_assets(type);
CREATE INDEX IF NOT EXISTS idx_assets_seizure_reason ON auction_assets(seizure_reason);
CREATE INDEX IF NOT EXISTS idx_assets_sanctions ON auction_assets(un_sanctions_compliance);
CREATE INDEX IF NOT EXISTS idx_assets_source ON auction_assets(source);
```

4. Click "Run query"

## Step 8: Update the Wrangler Configuration

1. Go to your GitHub repository (the one you forked)
2. Navigate to the `wrangler.toml` file
3. Click the pencil icon to edit the file
4. Find the line that says `database_id = "YOUR_DATABASE_ID_AFTER_CREATION"`
5. Replace `YOUR_DATABASE_ID_AFTER_CREATION` with the Database ID you noted in Step 6
6. Click "Commit changes" at the bottom of the page

## Step 9: Connect the Database to Your Pages Project

1. In your Cloudflare dashboard, go to "Workers & Pages"
2. Click on your "maltagovauctions" Pages project
3. Go to the "Settings" tab
4. Click on "Functions"
5. Under "D1 database bindings", click "Add binding"
6. Enter `DB` as the Variable name
7. Select your `maltagovauctions` database from the dropdown
8. Click "Save"

## Step 10: Trigger a New Deployment

1. In your Cloudflare dashboard, go to your Pages project
2. Click on the "Deployments" tab
3. Click "Retry deployment" on the latest deployment
4. Wait for the deployment to complete

## Step 11: Access Your Application

1. Once the deployment is complete, you'll see a "Visit site" button
2. Click this button to open your deployed MaltaGovAuctions application
3. Your application is now live at the URL provided by Cloudflare Pages (typically `https://maltagovauctions.pages.dev`)

## Troubleshooting

If you encounter any issues during deployment:

1. Check the deployment logs in Cloudflare Pages for specific error messages
2. Ensure your Database ID is correctly entered in the `wrangler.toml` file
3. Make sure the database binding is properly set up in your Pages project settings
4. Verify that the database schema was successfully created

## Next Steps

Now that your application is deployed, you can:

1. Add real data by setting up scheduled scraping of the data sources
2. Customize the UI to match your branding
3. Add user authentication for bidding functionality
4. Set up analytics to track user engagement

## Support

If you need further assistance, please contact the support team at the email address provided separately.

Congratulations! You've successfully deployed the MaltaGovAuctions MVP application to Cloudflare Pages with no coding required.
