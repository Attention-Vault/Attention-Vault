# Attention Vault

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Live Demo](https://img.shields.io/badge/demo-online-green.svg)](https://attention-vault.vercel.app/)
![Attention Vault Logo](frontend/public/logo.png)

## Token Vesting Based on Attention

Attention Vault is a decentralized platform that enables companies to create payment contracts with social media influencers where funds are released in predefined tranches (portions) based on attention metrics (likes, views, engagement). Built on Sonic SVM's blockchain, the platform provides a trustless way to structure partnerships where payments are guaranteed through smart contracts rather than traditional agreements.

## Core Problem Solved

Traditional influencer marketing faces several challenges:
- Companies must trust influencers to deliver promised content and engagement
- Influencers risk not getting paid after creating content
- Manual verification of performance metrics is time-consuming and error-prone
- Payment disputes arise from unclear success metrics

Attention Vault solves these problems by creating an automated, transparent system where:
1. Funds are secured in a smart contract upfront
2. Content verification is automated through LLM integrations (AI Agents).
3. Payments are released programmatically as engagement metrics are achieved
4. All transactions are transparent and verifiable on the Sonic SVM blockchain

## Technical Architecture

### Smart Contract (Sonic SVM)
Built using Anchor framework, the smart contract manages:
- Contract creation and fund escrowing
- Tranche configuration and distribution
- Payment verification and release
- Contract closure

Key contract functions:
- `create_contract`: Initialize a new payment arrangement with specified tranches
- `distribute_tranche`: Release a payment tranche to a recipient when metrics are met
- `close_contract`: Close the contract and return any remaining funds

### Backend System (Python/FastAPI)
The backend serves as the verification layer between social media and the blockchain:

- **API Endpoints**:
  - `/new_contract`: Create and validate new contracts
  - `/claim`: Verify post metrics and trigger smart contract payments
  - `/info/{contract_address}`: Retrieve contract metadata

- **Services**:
  - `twitter_service.py`: Validates Twitter posts and retrieves metrics
  - `solana_service.py`: Interacts with the Solana blockchain
  - `llm_service.py`: Verifies post content matches requirements
  - `db_service.py`: Stores and retrieves contract metadata
  - `distribute_tranche_service.py`: Executes payment distributions

### Frontend Application (Next.js)
A React-based web application that provides interfaces for both companies and influencers:

- **Company Dashboard**:
  - Create payment contracts with specified amounts and tranche counts
  - Manage existing contracts
  - Monitor engagement metrics
  - Close contracts when complete

- **Influencer Dashboard**:
  - View incoming payment contracts
  - Submit content for verification
  - Track payment status and progress
  - Monitor received and remaining funds

### Technical Stack
- **Blockchain**: Sonic SVM (Rust/Anchor framework)
- **Backend**: Python 3.11+, FastAPI, MongoDB
- **Frontend**: Next.js, TailwindCSS with DaisyUI, React Query
- **Integration**: Sonic SVM Web3.js, Wallet Adapter, @coral-xyz/anchor

## Core Workflow

1. **Contract Creation**:
   - Company creates a contract specifying total payment amount, number of tranches, and verification requirements
   - Funds are locked in the smart contract
   - Contract details are stored in the database with a unique blockchain address

2. **Content Creation**:
   - Influencer receives notification about the contract
   - Influencer creates Twitter content meeting the verification requirements
   - Influencer submits the post URL to the platform

3. **Automated Verification**:
   - System validates that the post author matches the expected Twitter handle
   - LLM verifies post content matches the specified requirements
   - API retrieves real-time engagement metrics (likes, retweets, etc.)

4. **Payment Distribution**:
   - When engagement thresholds are met, the system triggers a `distribute_tranche` transaction
   - Smart contract releases the appropriate portion of funds to the influencer's wallet
   - Contract status and metrics are updated in the database
   - Process repeats for subsequent tranches as higher engagement milestones are reached

5. **Contract Completion**:
   - When all tranches are distributed, the contract is marked complete
   - All transactions are recorded on the Solana blockchain for transparency

## Getting Started

### Prerequisites
- Node.js 16+
- Python 3.11+
- Solana CLI tools
- Twitter Developer Account with API credentials

### Backend Setup
1. Navigate to the backend directory: `cd backend`
2. Install dependencies: `uv sync` (recommended) or `pip install -e .`
3. Configure environment variables in `.env` file
4. Start the API server: `python main.py`

### Frontend Setup
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Configure environment variables in `.env.local` file
4. Start the development server: `npm run dev`

## Demo

The live demo is available at [https://attention-vault.vercel.app/](https://attention-vault.vercel.app/)

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.