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
import { useMemo, useState } from "react";
import { toast } from "react-hot-toast";

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
  const [postUrl, setPostUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const data = contractQuery.data;
  const trancheAmount = useMemo(() => {
    if (!data) return 0;
    return (
      data.totalAmount.toNumber() /
      data.trancheCount.toNumber() /
      LAMPORTS_PER_SOL
    );
  }, [data]);

  const handleSubmitPostUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postUrl.trim()) {
      toast.error("Please enter a post URL");
      return;
    }

    setIsSubmitting(true);
    const requestBody = {
      contract_address: contract.toString(),
      post_url: postUrl.trim(),
    };

    console.log("Submitting claim request:", requestBody);

    try {
      const response = await fetch(
        "https://attention-vault.ashwinshome.co.uk/api/claim",
        {
          method: "POST",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      const responseData = await response.json();
      console.log("Claim response:", {
        status: response.status,
        data: responseData,
      });

      if (responseData.success) {
        toast.success(`✓ ${responseData.message || "Success"}`);
        setPostUrl("");
      } else {
        toast.error(
          `${responseData.message || responseData.detail || "Error occurred"}`
        );
      }
    } catch (error) {
      console.error("Error submitting claim:", error);
      toast.error(" Network error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!data || contractQuery.isLoading) {
    return (
      <div className="card bg-base-200 shadow-xl animate-pulse">
        <div className="card-body">
          <div className="h-24 bg-base-300 rounded-lg"></div>
        </div>
      </div>
    );
  }

  const totalAmount = data.totalAmount.toNumber() / LAMPORTS_PER_SOL;
  const paidTranches = data.paidTranches.toNumber();
  const totalTranches = data.trancheCount.toNumber();
  const isCompleted = paidTranches === totalTranches;

  return (
    <div className="bg-base-100 rounded-lg border border-base-200 hover:border-primary transition-all duration-300 hover:shadow-md">
      <div className="p-6 relative">
        <div className="absolute top-4 right-4">
          <div
            className={`badge ${
              isCompleted ? "badge-success" : "badge-primary"
            } badge-lg`}
          >
            {isCompleted ? "Completed" : "Active"}
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-base-content/70"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <ExplorerLink
              path={`account/${contract}`}
              label={ellipsify(contract.toString())}
              className="text-sm text-base-content/70 hover:text-primary"
            />
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                isCompleted ? "bg-success" : "bg-primary animate-pulse"
              }`}
            ></div>
            <h3 className="text-lg font-semibold">
              {totalAmount.toFixed(2)} SOL
            </h3>
          </div>
          <div className="flex items-center gap-2 text-sm text-base-content/70">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
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
            <span>{trancheAmount.toFixed(2)} SOL per tranche</span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm font-medium">
                {paidTranches}/{totalTranches}
              </span>
            </div>
            <div className="h-2 bg-base-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  isCompleted ? "bg-success" : "bg-primary"
                }`}
                style={{ width: `${(paidTranches / totalTranches) * 100}%` }}
              ></div>
            </div>
          </div>

          {!isCompleted && (
            <form onSubmit={handleSubmitPostUrl} className="space-y-4 pt-4">
              <div className="form-control">
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="Enter your post URL"
                    className="input input-bordered flex-1"
                    value={postUrl}
                    onChange={(e) => setPostUrl(e.target.value)}
                    required
                  />
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="loading loading-spinner loading-sm"></span>
                    ) : (
                      "Submit"
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-base-content/70"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <ExplorerLink
                path={`account/${data.owner}`}
                label={ellipsify(data.owner.toString())}
                className="text-sm text-base-content/70 hover:text-primary"
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
            You don&apos;t have any incoming payment contracts yet.
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
