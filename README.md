# Attention-Vault

## Google docs:

- [https://docs.google.com/document/d/1JVDN-B4Ckw29qHCx9G65NV3NN8w-uo9B2ff40uNOPKQ/edit?usp=sharing](https://docs.google.com/document/d/1JVDN-B4Ckw29qHCx9G65NV3NN8w-uo9B2ff40uNOPKQ/edit?usp=sharing)

## Attention Vault Project Overview
This project is a decentralized application (dApp) called "Attention Vault" built on the Solana blockchain. It's designed to facilitate partnerships between companies and influencers through automated, transparent payment contracts.

## Core Concept
Attention Vault serves as a platform that enables companies to create payment contracts with influencers where funds are released in predefined tranches (portions) based on milestones or time intervals. This provides a trustless way to structure partnerships where payments are guaranteed through blockchain technology rather than traditional agreements.

Smart Contract (Backend)
The smart contract is built using Solana's Anchor framework, which is a development framework for writing Solana programs (smart contracts) in Rust.

Key Contract Features:
Payment Contract Creation: Companies can create a contract by specifying:

Total amount to be paid
Number of tranches (payment installments)
Recipient addresses (influencers)
Tranche Distribution: The contract supports distributing payments in equal tranches to specified recipients. Each tranche can only be released to the designated recipient.

Contract Closure: After all tranches are paid or if needed earlier, contracts can be closed with any remaining funds returned to the owner.

Smart Contract Structure:
The contract is written in Rust using Anchor framework
Contains account structures for storing payment data
Implements three main instructions:
create_contract: Initialize a new payment arrangement
distribute_tranche: Release a payment tranche to a recipient
close_contract: Close the contract and return any remaining funds
Frontend Application
The frontend is built with Next.js (React framework) and integrates with the Solana blockchain through various Solana client libraries. It provides separate dashboards for companies and influencers.

Key Frontend Features:
Company Dashboard:

Create payment contracts with specified amounts and tranche counts
Manage existing contracts
Distribute tranches when milestones are reached
Close contracts when complete
Influencer Dashboard:

View incoming payment contracts
Monitor payment status and progress
Track received and remaining funds
Technical Stack:
Next.js: React framework for the web application
TailwindCSS with DaisyUI: For styling and UI components
React Query: For state management and data fetching
Solana Web3.js and Wallet Adapter: For blockchain interactions
Jotai: For lightweight state management
@coral-xyz/anchor: For interfacing with the Anchor program (smart contract)
Application Architecture
The codebase follows a well-organized structure:

Components: Organized by feature (frontend, influencer, account, cluster, etc.)
Data Access Layer: Each component has associated data access files for blockchain interactions
UI Components: Separated from logic for better maintainability
Smart Contract: Located in the anchor/programs/frontend directory
The frontend interface connects to the Solana blockchain using wallet adapters, allowing users to interact with the smart contract by signing transactions with their Solana wallets.

Project Goals
Based on the implementation, this project aims to:

Provide Transparency: By using blockchain technology, all parties can verify contract terms and payment status.

Automate Payments: Eliminate the need for manual transfers and provide a trustless payment system.

Secure Funds: Companies can deposit funds upfront, ensuring influencers that payment is available.

Structured Releases: Allow payments to be released incrementally based on performance or time-based milestones.

This solution addresses common challenges in influencer marketing, such as payment disputes, lack of transparency, and complex payment schedules, by leveraging blockchain technology to create a trustless and efficient system for handling business relationships between companies and influencers.