import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import { Metaplex, walletAdapterIdentity } from "@metaplex-foundation/js";
import { Connection, clusterApiUrl, PublicKey, Keypair } from "@solana/web3.js";
import WalletButton from "../components/WalletButton";

export default function Home() {
  const wallet = useWallet();
  const { publicKey, connected } = wallet;
  const [loading, setLoading] = useState(false);
  const [nftName, setNftName] = useState('My Solana NFT');
  const [mintStatus, setMintStatus] = useState('');
  const [mintedNFT, setMintedNFT] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setImageUrl(url);
    setPreviewUrl(url);
  };

  // Upload metadata JSON to Filebase via API route
  const uploadMetadataToFilebase = async (metadata) => {
    try {
      setMintStatus('Uploading metadata to Filebase...');
      
      const response = await fetch('/api/upload-metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ metadata }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload metadata');
      }
      
      const data = await response.json();
      console.log("Uploaded metadata to Filebase:", data);
      
      return data.metadataUri;
    } catch (error) {
      console.error("Error uploading to Filebase:", error);
      throw new Error(`Filebase upload failed: ${error.message}`);
    }
  };

  const mintNFT = async () => {
    if (!connected) {
      setMintStatus('Please connect your wallet first');
      return;
    }

    if (!nftName || !imageUrl) {
      setMintStatus('Please fill in both name and image URL');
      return;
    }

    setLoading(true);
    setMintStatus('Starting NFT minting process...');

    try {
      console.log("Starting NFT minting process...");
      
      const connection = new Connection(clusterApiUrl("devnet"));
      const metaplex = new Metaplex(connection);
      
      // Configure Metaplex with wallet
      metaplex.use(walletAdapterIdentity(wallet));

      // Generate a new mint account
      const mintKeypair = Keypair.generate();
      console.log("Generated mint address:", mintKeypair.publicKey.toBase58());
      setMintStatus(`Generated mint address: ${mintKeypair.publicKey.toBase58()}`);

      // Create metadata JSON
      const metadata = {
        name: nftName,
        description: `A Solana NFT created with Filebase IPFS storage`,
        image: imageUrl,
        attributes: [],
        properties: {
          files: [{
            uri: imageUrl,
            type: "image/jpeg"
          }]
        }
      };
      
      // Upload metadata to Filebase and get URI
      const metadataUri = await uploadMetadataToFilebase(metadata);
      console.log("Metadata URI:", metadataUri);
      setMintStatus(`Metadata uploaded to: ${metadataUri}`);

      // Create NFT using the mintKeypair
      setMintStatus('Creating NFT on Solana...');
      const { nft } = await metaplex.nfts().create({
        uri: metadataUri,
        name: nftName,
        sellerFeeBasisPoints: 500,
        useNewMint: mintKeypair,
        tokenOwner: publicKey,
      });

      console.log("NFT created successfully!");
      console.log("Mint address:", nft.address.toBase58());
      console.log("Metadata address:", nft.metadataAddress.toBase58());
      
      setMintedNFT({
        mintAddress: nft.address.toBase58(),
        metadataAddress: nft.metadataAddress.toBase58(),
        metadataUri: metadataUri
      });
      
      setMintStatus('NFT minted successfully!');
    } catch (error) {
      console.error("Error minting NFT:", error);
      setMintStatus(`Error minting NFT: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8 font-sans">
      <h1 className="text-4xl text-gray-700 mb-8 text-center">
        Solana NFT Minter with Filebase
      </h1>
      
      <div className="flex flex-col items-center mb-8">
        <WalletButton />
        {connected && (
          <p className="mt-2 text-emerald-600 font-bold">
            Connected: {publicKey.toString().slice(0, 8)}...
          </p>
        )}
      </div>

      <div className="bg-gray-50 rounded-lg p-8 shadow-md">
        <div className="mb-6">
          <label className="block mb-2 font-bold text-gray-600">
            NFT Name
          </label>
          <input
            type="text"
            value={nftName}
            onChange={(e) => setNftName(e.target.value)}
            placeholder="Enter NFT name"
            disabled={loading}
            className="w-full p-3 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        
        <div className="mb-6">
          <label className="block mb-2 font-bold text-gray-600">
            NFT Image URL
          </label>
          <input
            type="url"
            value={imageUrl}
            onChange={handleImageUrlChange}
            placeholder="Enter image URL"
            disabled={loading}
            className="w-full p-3 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
          />
          
          {previewUrl && (
            <div className="p-4 border border-gray-300 rounded-md bg-gray-100">
              <img
                src={previewUrl}
                alt="NFT preview"
                className="max-w-full max-h-[200px] rounded-md mx-auto"
              />
              <p className="mt-2 text-center text-gray-500">Preview of your NFT image</p>
            </div>
          )}
        </div>
        
        <button
          onClick={mintNFT}
          disabled={!connected || loading}
          className={`w-full py-3 px-6 rounded-md font-bold text-white text-base transition-colors
            ${!connected || loading
              ? 'bg-purple-300 cursor-not-allowed' 
              : 'bg-purple-600 hover:bg-purple-700 cursor-pointer'}`}
        >
          {loading ? 'Minting...' : 'Mint NFT'}
        </button>
        
        {mintStatus && (
          <div className="mt-4 p-4 rounded-md bg-gray-100 font-medium">
            {mintStatus}
          </div>
        )}
        
        {mintedNFT && (
          <div className="mt-4 p-4 rounded-md bg-emerald-500 text-white font-medium">
            <p className="mb-2">NFT Minted Successfully!</p>
            <p className="mb-2">Mint Address: {mintedNFT.mintAddress}</p>
            <p className="mb-2">Metadata Address: {mintedNFT.metadataAddress}</p>
            <p className="mb-2">Metadata URI: {mintedNFT.metadataUri}</p>
            <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0 mt-4">
              <a 
                href={`https://explorer.solana.com/address/${mintedNFT.mintAddress}?cluster=devnet`} 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-4 py-2 bg-white text-emerald-500 rounded-md font-bold no-underline hover:bg-gray-50 text-center"
              >
                View on Solana Explorer
              </a>
              <a 
                href={mintedNFT.metadataUri} 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-4 py-2 bg-white text-emerald-500 rounded-md font-bold no-underline hover:bg-gray-50 text-center"
              >
                View Metadata
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}