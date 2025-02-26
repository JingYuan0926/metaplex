# Metaplex Setup Guide

## Installation

Clone the repository:
```sh
git clone https://github.com/JingYuan0926/metaplex.git
```

Navigate to the project directory:
```sh
cd metaplex
```

Install dependencies:
```sh
npm install
```

## Environment Setup

Rename `.env.example` to `.env`:
```sh
mv .env.example .env
```

## Filebase Setup

1. Sign up and create a bucket on [Filebase](https://console.filebase.com/).
2. Retrieve your Filebase API credentials.
3. Fill in the `.env` file with the following values:
   ```sh
   FILEBASE_KEY=your_filebase_key
   FILEBASE_SECRET=your_filebase_secret
   FILEBASE_BUCKET=your_filebase_bucket
   ```

## Required Dependencies

Install the following npm packages:
```sh
npm install @solana/wallet-adapter-react-ui @solana/wallet-adapter-wallets @metaplex-foundation/js @filebase/sdk
```

## Deployment

The project has been deployed and can be accessed at:
[Metaplex Deployment](https://metaplex-taupe-nine.vercel.app/)