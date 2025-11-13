# GhostVote - DAO Privacy Voting System

A fully encrypted DAO voting system built with FHEVM (Fully Homomorphic Encryption Virtual Machine). Vote results remain completely private and encrypted on-chain, with anyone able to decrypt final aggregated tallies for transparency.

## 🎥 Demo Video

[![GhostVote Demo](https://img.shields.io/badge/Watch-Demo%20Video-blue?style=for-the-badge&logo=youtube)](https://github.com/UlaReynolds/ghost-vote-vault/blob/main/ghost-vote.mp4)

**Live Demo**: [https://ghost-vote.vercel.app/](https://ghost-vote.vercel.app/)

## 🔐 Core Encryption & Decryption Logic

### How FHEVM Encryption Works

GhostVote leverages **Fully Homomorphic Encryption (FHE)** to enable private voting while allowing mathematical operations on encrypted data:

1. **Vote Encryption**: Each vote (0 = Against, 1 = For) is encrypted client-side using FHEVM SDK
2. **Homomorphic Addition**: The smart contract performs addition on encrypted votes without decrypting them
3. **Privacy Preservation**: Individual votes remain encrypted; only aggregated totals can be decrypted
4. **Public Verification**: Anyone can request decryption access to verify final results

### Contract Encryption Flow

```solidity
// Encrypted vote storage (euint8 = encrypted 8-bit unsigned integer)
euint8 public totalVotesFor;
euint8 public totalVotesAgainst;

// Homomorphic addition of encrypted votes
function vote(uint256 _proposalId, externalEuint8 inputEuint8, bytes calldata inputProof) external {
    // Convert input to encrypted type
    euint8 voteValue = FHE.asEuint8(inputEuint8, inputProof);
    
    // Homomorphic operations on encrypted data
    proposal.totalVotesFor = FHE.add(proposal.totalVotesFor, FHE.select(voteValue, FHE.asEuint8(1), FHE.asEuint8(0)));
    proposal.totalVotesAgainst = FHE.add(proposal.totalVotesAgainst, FHE.select(voteValue, FHE.asEuint8(0), FHE.asEuint8(1)));
    
    // Grant decryption permission to voter
    FHE.allow(proposal.totalVotesFor, msg.sender);
    FHE.allow(proposal.totalVotesAgainst, msg.sender);
}
```

### Frontend Decryption Flow

```typescript
// 1. Request decryption access (anyone can call this)
await contract.requestDecryptionAccess(proposalId);

// 2. Generate decryption signature
const signature = await FhevmDecryptionSignature.loadOrSign(
    instance,
    [contractAddress],
    signer,
    storage
);

// 3. Decrypt encrypted values
const { values } = await instance.userDecrypt(
    contractAddress,
    signature.signedDigest,
    signature.publicKey,
    [votesForHandle, votesAgainstHandle]
);

// 4. Display decrypted results
const votesFor = Number(values[0]);
const votesAgainst = Number(values[1]);
```

### Key Cryptographic Components

- **euint8**: Encrypted 8-bit unsigned integer type from FHEVM
- **FHE.add()**: Homomorphic addition (adds encrypted values without decryption)
- **FHE.select()**: Homomorphic conditional selection
- **FHE.allow()**: Grant decryption permission to specific addresses
- **EIP-712 Signature**: Secure decryption signature using wallet private key

## Features

- **Fully Encrypted Votes**: All votes are encrypted using FHEVM
- **Privacy Preserved**: Individual votes remain hidden; only aggregated results can be decrypted
- **Open Participation**: Anyone can create proposals and vote (democratic governance)
- **Public Decryption**: Anyone can decrypt final aggregated results (transparent results)
- **Modern UI**: Beautiful, balanced two-column layout with rich visual indicators
- **Rainbow Wallet Integration**: Easy wallet connection with RainbowKit
- **Decryption Signatures**: Secure vote decryption using FHEVM SDK

## Architecture

### Smart Contract (`GhostVote.sol`)
- Create proposals with title, description, and deadline
- Cast encrypted votes (0 = Against, 1 = For)
- Homomorphic addition of encrypted votes
- Public decryption of final results (anyone can decrypt)

### Frontend
- Next.js 15 with App Router
- Rainbow wallet integration (WalletConnect Project ID configured via environment variable)
- FHEVM SDK for encryption/decryption
- Real-time proposal updates
- Infura RPC integration

## Getting Started

### Prerequisites
- Node.js >= 20
- npm >= 7.0.0
- MetaMask or compatible Web3 wallet

### Installation

1. Install dependencies:
```bash
npm install
```

2. Compile contracts:
```bash
npm run compile
```

3. Run tests:
```bash
npm run test
```

All tests should pass (6/6) ✅

### Local Development

#### Step 1: Start Local Hardhat Node

```bash
npx hardhat node
```

Keep this terminal running. Note the first account address - this will be the admin.

#### Step 2: Deploy Contract

In a new terminal:

```bash
npx hardhat deploy --network localhost
```

Contract will be deployed to: `0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9`

#### Step 3: Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will start at `http://localhost:3000`

#### Step 4: Configure MetaMask

**CRITICAL: Use these EXACT values to avoid RPC errors**

1. Add Localhost network:
   - Network Name: `Localhost 8545`
   - RPC URL: `http://127.0.0.1:8545` (NOT http://localhost:8545)
   - Chain ID: `31337` (NOT 1337)
   - Currency Symbol: `ETH`

2. **If you already have a "Localhost" network:**
   - Delete it (Settings > Networks > Delete)
   - Add new network with values above
   - This fixes "RPC endpoint returned too many errors"

3. Import test account:
   - Copy private key from hardhat node terminal
   - MetaMask > Account icon > Import Account
   - Paste private key
   - You should see ~10000 ETH

#### Step 5: Use Application

1. Open `http://localhost:3000`
2. Connect wallet (Rainbow Kit button in top-right)
3. Wait for FHEVM to initialize
4. **Anyone can**:
   - Create new proposals
   - Vote on existing proposals (FOR or AGAINST)
   - Decrypt final vote results (transparent results)
   - View proposal status and voter counts
5. **Admin** (deployer account) can also:
   - Close proposals

### Deploying to Sepolia

#### Step 1: Set Environment Variables

```bash
npx hardhat vars set MNEMONIC "your twelve word mnemonic here"
npx hardhat vars set INFURA_API_KEY "your_infura_api_key"
npx hardhat vars set ETHERSCAN_API_KEY "your_etherscan_api_key"
```

For the frontend, create a `frontend/.env.local` file (do not commit it) with:

```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
NEXT_PUBLIC_INFURA_API_KEY=your_infura_api_key
```

Or use private key:

```bash
npx hardhat vars set PRIVATE_KEY "your_private_key"
```

#### Step 2: Get Sepolia ETH

Get test ETH from Sepolia faucet:
- https://sepoliafaucet.com/
- https://www.alchemy.com/faucets/ethereum-sepolia

#### Step 3: Deploy

```bash
npx hardhat deploy --network sepolia
```

Note the deployed contract address.

#### Step 4: Update Frontend

Update `frontend/abi/GhostVoteAddresses.ts`:

```typescript
export const GhostVoteAddresses = {
  "31337": "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
  "11155111": "YOUR_SEPOLIA_CONTRACT_ADDRESS"
} as const;
```

#### Step 5: Test Sepolia

```bash
npm run test:sepolia
```

## Usage Guide

### User Functions (Anyone)

**Create Proposal**
1. Fill in proposal form (visible to all connected users)
2. Set title, description, and duration (in days)
3. Click "Create Proposal"
4. Confirm transaction in wallet

**Cast Vote**
1. Connect wallet
2. Select an active proposal from the list
3. Read proposal details
4. Click "Vote FOR" or "Vote AGAINST"
5. Confirm transaction
6. Vote is encrypted and submitted

**Decrypt Results**
1. Select a proposal
2. Click "Decrypt Results" in Results Panel
3. Confirm transaction to request decryption access
4. Sign decryption permission (one-time)
5. Wait for decryption
6. View vote totals with visual charts

### Admin-Only Functions

**Close Proposal**
1. Select a proposal
2. Click "Close Proposal"
3. Confirm transaction
4. Proposal becomes inactive

### Voter Functions

**View Status**
- See all proposals with status badges  
- Check total voter count
- View proposal deadlines
- Cannot vote twice on same proposal

## Technical Details

### Network Configuration

- **Localhost**: Chain ID 31337, RPC: http://127.0.0.1:8545
- **Sepolia**: Chain ID 11155111, RPC: Infura

### Encryption Flow

1. User submits vote (0 or 1)
2. Frontend encrypts with FHEVM SDK
3. Encrypted vote + proof sent to contract
4. Contract performs homomorphic addition
5. Results remain encrypted on-chain
6. Anyone can request decryption access and decrypt with signature

### Decryption Flow

1. User clicks "Decrypt Results"
2. Contract grants decryption access to the user
3. FHEVM SDK generates decryption signature
4. Signature stored in browser (reusable)
5. Encrypted handles fetched from contract
6. SDK decrypts handles locally
7. Results displayed in UI

## Technology Stack

- **Blockchain**: Ethereum with FHEVM
- **Smart Contracts**: Solidity 0.8.27
- **Frontend**: Next.js 15, React 19
- **Wallet**: RainbowKit 2.2.1 + Wagmi 2.13.5
- **Styling**: Tailwind CSS 3.4.1
- **Encryption**: Zama FHEVM SDK (@zama-fhe/relayer-sdk 0.2.0)
- **RPC Provider**: Infura

## Project Structure

```
ghost-vote/
├── contracts/
│   └── GhostVote.sol              # Main smart contract
├── test/
│   ├── GhostVote.ts               # Local tests
│   └── GhostVoteSepolia.ts        # Sepolia tests
├── deploy/
│   └── deploy.ts                  # Deployment script
├── frontend/
│   ├── abi/                       # Contract ABI & addresses
│   ├── app/                       # Next.js app
│   ├── components/                # React components
│   ├── fhevm/                     # FHEVM SDK integration
│   ├── hooks/                     # Custom hooks
│   └── config/                    # Configuration
└── README.md                      # This file
```

## Troubleshooting

**Issue**: Contract not deployed
- **Solution**: Make sure hardhat node is running and contract is deployed

**Issue**: FHEVM initialization failed / "providerOrUrl.request is not a function"
- **Solution**: 
  - Make sure you're using MetaMask or a compatible wallet
  - For localhost, the app uses RPC URL directly: http://127.0.0.1:8545
  - For Sepolia, make sure MetaMask is connected
  - Refresh the page after switching networks

**Issue**: Decryption failed
- **Solution**: Make sure you have confirmed the transaction to request decryption access and have signed the decryption permission

**Issue**: Transaction rejected
- **Solution**: Check MetaMask is on correct network and has ETH

**Issue**: "Chain ID mismatch"
- **Solution**: Switch MetaMask to correct network (31337 for localhost)

**Issue**: "missing revert data" error
- **Solution**: 
  - Contract might not be deployed
  - Run: `npx hardhat deploy --network localhost`
  - Make sure hardhat node is running

## License

BSD-3-Clause-Clear

## Credits

- **FHEVM Technology**: Zama
- **Template**: fhevm-hardhat-template
- **Wallet Integration**: Rainbow Kit

---

**Status**: ✅ Production Ready  
**Version**: 0.1.0  
**Chain ID (Local)**: 31337  
**Chain ID (Sepolia)**: 11155111

