"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletButton } from "../solana/solana-provider";
import { AppHero, ellipsify } from "../ui/ui-layout";
import { ExplorerLink } from "../cluster/cluster-ui";
import {
  useFrontendProgram,
  useFrontendProgramContract,
} from "../frontend/frontend-data-access";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useMemo } from "react";

function ProgressBar({ current, total }: { current: number; total: number }) {
  const percentage = (current / total) * 100;
  return (
    <div className="relative w-full h-4 bg-base-300 rounded-full overflow-hidden">
      <div
        className="absolute h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 ease-out"
        style={{ width: `${percentage}%` }}
      />
      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-xs font-bold">
        {current} / {total}
      </div>
    </div>
  );
}

function AnimatedValue({ value }: { value: number }) {
  return (
    <div className="text-4xl font-bold bg-gradient-to-r from-primary to-accent text-transparent bg-clip-text animate-pulse">
      {value.toFixed(2)} SOL
    </div>
  );
}

function ContractCard({ contract }: { contract: PublicKey }) {
  const { contractQuery } = useFrontendProgramContract({
    contractAddress: contract,
  });

  const data = contractQuery.data;
  const trancheAmount = useMemo(() => {
    if (!data) return 0;
    return (
      data.totalAmount.toNumber() /
      data.trancheCount.toNumber() /
      LAMPORTS_PER_SOL
    );
  }, [data]);

  if (!data || contractQuery.isLoading) {
    return (
      <div className="card bg-base-200 shadow-xl animate-pulse">
        <div className="card-body">
          <div className="h-32 bg-base-300 rounded-lg"></div>
        </div>
      </div>
    );
  }

  const totalAmount = data.totalAmount.toNumber() / LAMPORTS_PER_SOL;
  const paidAmount = data.paidTranches.toNumber() * trancheAmount;
  const remainingAmount = totalAmount - paidAmount;

  return (
    <div className="card bg-base-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
      <div className="card-body">
        <div className="absolute top-4 right-4">
          <div
            className={`badge ${
              data.paidTranches.toNumber() === data.trancheCount.toNumber()
                ? "badge-success"
                : "badge-primary"
            } badge-lg`}
          >
            {data.paidTranches.toNumber() === data.trancheCount.toNumber()
              ? "Completed"
              : "Active"}
          </div>
        </div>

        <h2 className="card-title justify-center mb-6 text-2xl">
          Payment Contract
        </h2>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="stat bg-base-300 rounded-box p-4">
            <div className="stat-title">Total Value</div>
            <AnimatedValue value={totalAmount} />
          </div>
          <div className="stat bg-base-300 rounded-box p-4">
            <div className="stat-title">Per Tranche</div>
            <AnimatedValue value={trancheAmount} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-base-300 rounded-box p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold">Progress</span>
              <span className="text-sm">
                {(
                  (data.paidTranches.toNumber() /
                    data.trancheCount.toNumber()) *
                  100
                ).toFixed(0)}
                %
              </span>
            </div>
            <ProgressBar
              current={data.paidTranches.toNumber()}
              total={data.trancheCount.toNumber()}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-success/20 rounded-box p-4">
              <div className="text-sm">Received</div>
              <div className="text-xl font-bold text-success">
                {paidAmount.toFixed(2)} SOL
              </div>
            </div>
            <div className="bg-primary/20 rounded-box p-4">
              <div className="text-sm">Remaining</div>
              <div className="text-xl font-bold text-primary">
                {remainingAmount.toFixed(2)} SOL
              </div>
            </div>
          </div>

          <div className="divider"></div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-base-content/70">Contract ID</span>
              <ExplorerLink
                path={`account/${contract}`}
                label={ellipsify(contract.toString())}
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-base-content/70">From</span>
              <ExplorerLink
                path={`account/${data.owner}`}
                label={ellipsify(data.owner.toString())}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContractList() {
  const { publicKey } = useWallet();
  const { contracts, getProgramAccount } = useFrontendProgram();

  const myContracts = useMemo(() => {
    if (!contracts.data || !publicKey) return [];
    return contracts.data.filter((contract) => {
      const recipients = contract.account.recipients;
      return recipients.some(
        (recipient) => recipient.toString() === publicKey.toString()
      );
    });
  }, [contracts.data, publicKey]);

  if (getProgramAccount.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    );
  }

  if (!getProgramAccount.data?.value) {
    return (
      <div className="alert alert-info shadow-lg max-w-2xl mx-auto">
        <div className="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="stroke-current shrink-0 w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <span>
            Program account not found. Make sure you are on the correct cluster.
          </span>
        </div>
      </div>
    );
  }

  const activeContracts = myContracts.filter(
    (contract) =>
      contract.account.paidTranches.toNumber() <
      contract.account.trancheCount.toNumber()
  );

  const completedContracts = myContracts.filter(
    (contract) =>
      contract.account.paidTranches.toNumber() ===
      contract.account.trancheCount.toNumber()
  );

  return (
    <div className="space-y-8">
      {contracts.isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="loading loading-spinner loading-lg text-primary"></div>
        </div>
      ) : myContracts.length ? (
        <>
          {activeContracts.length > 0 && (
            <div>
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                Active Contracts
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                {activeContracts.map((contract) => (
                  <ContractCard
                    key={contract.publicKey.toString()}
                    contract={contract.publicKey}
                  />
                ))}
              </div>
            </div>
          )}

          {completedContracts.length > 0 && (
            <div>
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success"></div>
                Completed Contracts
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                {completedContracts.map((contract) => (
                  <ContractCard
                    key={contract.publicKey.toString()}
                    contract={contract.publicKey}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 bg-base-200 rounded-box">
          <div className="icon-placeholder w-16 h-16 mx-auto mb-4 rounded-full bg-base-300 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-base-content/70"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold mb-2">No Contracts Found</h2>
          <p className="text-base-content/70">
            You don't have any incoming payment contracts yet.
          </p>
        </div>
      )}
    </div>
  );
}

export default function InfluencerUi() {
  const { publicKey } = useWallet();
  const { programId } = useFrontendProgram();

  return publicKey ? (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      <AppHero
        title={
          <div className="flex items-center justify-center w-full">
            <h1 className="text-4xl font-bold text-center">
              Influencer Dashboard
            </h1>
          </div>
        }
        subtitle="Track and manage your incoming payment contracts"
      >
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="text-base-content/70">Program ID:</span>
          <ExplorerLink
            path={`account/${programId}`}
            label={ellipsify(programId.toString())}
          />
        </div>
      </AppHero>
      <ContractList />
    </div>
  ) : (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
      <div className="text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-lg bg-primary/10 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <h1 className="text-4xl font-bold">Welcome to Your Dashboard</h1>
        <p className="text-xl text-base-content/70">
          Connect your wallet to view your contracts
        </p>
        <div className="mt-8">
          <WalletButton />
        </div>
      </div>
    </div>
  );
}
