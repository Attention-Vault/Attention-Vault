"use client";

import { Keypair, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useMemo, useState, useEffect } from "react";
import { ellipsify, AppHero } from "../ui/ui-layout";
import { ExplorerLink } from "../cluster/cluster-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletButton } from "../solana/solana-provider";
import {
  useFrontendProgram,
  useFrontendProgramContract,
} from "./frontend-data-access";
import { toast } from "react-hot-toast";

function ProgressBar({ current, total }: { current: number; total: number }) {
  const percentage = (current / total) * 100;
  return (
    <div className="relative w-full h-2 bg-base-300 rounded-full overflow-hidden">
      <div
        className="absolute h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 ease-out"
        style={{ width: `${percentage}%` }}
      />
      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-xs">
        {current}/{total}
      </div>
    </div>
  );
}

function ContractCard({ contract }: { contract: PublicKey }) {
  const { contractQuery, distributeTranchesMutation, closeContractMutation } =
    useFrontendProgramContract({
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
        <button
          className="btn btn-ghost btn-sm absolute top-2 right-2"
          onClick={() => {
            if (
              window.confirm("Are you sure you want to close this contract?")
            ) {
              closeContractMutation.mutateAsync();
            }
          }}
          disabled={closeContractMutation.isPending}
        >
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
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>

        <div className="flex items-center justify-between mb-1">
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
                path={`account/${data.recipients[0]}`}
                label={ellipsify(data.recipients[0].toString())}
                className="text-sm text-base-content/70 hover:text-primary"
              />
            </div>
            {!isCompleted && (
              <button
                className="btn btn-sm btn-primary"
                onClick={() => distributeTranchesMutation.mutateAsync()}
                disabled={distributeTranchesMutation.isPending}
              >
                Distribute
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CreateContract() {
  const { createContract, program } = useFrontendProgram();
  const [totalAmount, setTotalAmount] = useState("");
  const [trancheCount, setTrancheCount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [twitterHandle, setTwitterHandle] = useState("");
  const [verificationText, setVerificationText] = useState("");
  const [trancheDistribution, setTrancheDistribution] = useState<string[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const count = parseInt(trancheCount);
    if (!isNaN(count) && count > 0) {
      setTrancheDistribution(Array(count).fill("0"));
    } else {
      setTrancheDistribution([]);
    }
  }, [trancheCount]);

  const handleTrancheDistributionChange = (index: number, value: string) => {
    const newDistribution = [...trancheDistribution];
    newDistribution[index] = value;
    setTrancheDistribution(newDistribution);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const amount = parseFloat(totalAmount);
    const tranches = parseInt(trancheCount);

    if (isNaN(amount) || amount <= 0) {
      setError("Total amount must be greater than 0");
      return;
    }

    if (isNaN(tranches) || tranches <= 0) {
      setError("Number of tranches must be greater than 0");
      return;
    }

    if (!twitterHandle) {
      setError("Twitter handle is required");
      return;
    }

    if (!verificationText) {
      setError("Verification text is required");
      return;
    }

    const distribution = trancheDistribution.map(Number);
    if (distribution.some(isNaN) || distribution.some((n) => n <= 0)) {
      setError("All tranche distribution values must be positive numbers");
      return;
    }

    try {
      const recipientPubkey = new PublicKey(recipient.trim());
      const recipients = Array(tranches).fill(recipientPubkey);
      const keypair = Keypair.generate();
      const contractAddress = keypair.publicKey.toString();

      // Log the contract address that will be created
      console.log("Generated contract address:", contractAddress);
      toast.loading("Creating smart contract...");

      const result = await createContract.mutateAsync({
        keypair,
        totalAmount: amount,
        trancheCount: tranches,
        recipients: recipients,
      });

      if (result) {
        // Clear the loading toast
        toast.dismiss();
        console.log("Transaction signature:", result);
        console.log("Contract address:", contractAddress);

        // Show message about waiting for confirmation
        const waitingToast = toast.loading(
          "Contract confirmation may take up to 30 seconds, do not leave this page"
        );

        // First attempt after 15 seconds
        await new Promise((resolve) => setTimeout(resolve, 15000));

        let success = await makeApiCall(
          contractAddress,
          tranches,
          distribution,
          verificationText,
          twitterHandle
        );

        // If first attempt fails, try again after another 15 seconds
        if (!success) {
          await new Promise((resolve) => setTimeout(resolve, 15000));
          success = await makeApiCall(
            contractAddress,
            tranches,
            distribution,
            verificationText,
            twitterHandle
          );
        }

        // Dismiss the waiting toast
        toast.dismiss(waitingToast);

        if (success) {
          toast.success("Contract created and confirmed successfully");
        }
        return success;
      }
    } catch (err: any) {
      toast.dismiss();
      setError(err.message || "Invalid recipient address format");
    }
  };

  async function makeApiCall(
    contractAddress: string,
    tranches: number,
    distribution: number[],
    verificationText: string,
    twitterHandle: string
  ) {
    const loadingToast = toast.loading("Setting up contract...");

    const apiRequestBody = {
      contract_address: contractAddress,
      verification_text: verificationText,
      twitter_handle: twitterHandle,
      number_of_tranches: tranches,
      tranche_distribution: distribution,
    };

    console.log("API Request Body:", JSON.stringify(apiRequestBody, null, 2));
    console.log("Contract address being sent:", contractAddress);

    try {
      const response = await fetch(
        "https://attention-vault.ashwinshome.co.uk/api/new_contract",
        {
          method: "POST",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(apiRequestBody),
        }
      );

      // Log raw response
      const rawResponse = await response.text();
      console.log("Raw API Response:", rawResponse);

      // Dismiss the loading toast
      toast.dismiss(loadingToast);

      if (!response.ok) {
        console.error("API Error Response:", rawResponse);
        toast.error("Failed to complete contract setup");
        return false;
      }

      const responseData = JSON.parse(rawResponse);
      console.log("Parsed API Response:", responseData);

      if (responseData.success === false) {
        return false;
      }

      return true;
    } catch (err: any) {
      console.error("API Error:", err);
      toast.error("Failed to complete contract setup");
      return false;
    }
  }

  return (
    <div className="bg-base-100 p-6 md:p-8 border-b border-base-300">
      <h2 className="text-2xl font-bold mb-6">Create Payment Contract</h2>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        <div className="form-control">
          <label className="label py-1">
            <span className="label-text text-base font-medium">
              Recipient Address
            </span>
          </label>
          <input
            type="text"
            className="input input-bordered w-full bg-base-100"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Enter the recipient's Solana address"
          />
        </div>

        <div className="form-control">
          <label className="label py-1">
            <span className="label-text text-base font-medium">
              Twitter Handle
            </span>
          </label>
          <input
            type="text"
            className="input input-bordered w-full bg-base-100"
            value={twitterHandle}
            onChange={(e) => setTwitterHandle(e.target.value)}
            placeholder="Enter the influencer's Twitter handle"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text text-base font-medium">
                Total Amount (SOL)
              </span>
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              className="input input-bordered w-full bg-base-100 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text text-base font-medium">
                Number of Tranches
              </span>
            </label>
            <input
              type="number"
              min="0"
              className="input input-bordered w-full bg-base-100 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              value={trancheCount}
              onChange={(e) => setTrancheCount(e.target.value)}
              placeholder="0"
            />
          </div>
        </div>

        {trancheDistribution.length > 0 && (
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text text-base font-medium">
                Required Likes per Tranche
              </span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {trancheDistribution.map((value, index) => (
                <div key={index} className="form-control">
                  <label className="label py-1">
                    <span className="label-text">Tranche {index + 1}</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="input input-bordered w-full bg-base-100 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    value={value}
                    onChange={(e) =>
                      handleTrancheDistributionChange(index, e.target.value)
                    }
                    placeholder="0"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="form-control">
          <label className="label py-1">
            <span className="label-text text-base font-medium">
              Verification Conditions
            </span>
          </label>
          <textarea
            className="textarea textarea-bordered h-32 bg-base-100"
            value={verificationText}
            onChange={(e) => setVerificationText(e.target.value)}
            placeholder="Describe the conditions under which the payment shall or shall not be made..."
          />
        </div>

        {error && <div className="alert alert-error py-3 text-sm">{error}</div>}
        <button
          type="submit"
          className="btn btn-primary btn-md w-full md:w-auto"
          disabled={createContract.isPending}
        >
          Create Contract
        </button>
      </form>
    </div>
  );
}

type ContractGroup = {
  recipient: string;
  active: Array<{ publicKey: PublicKey; account: any }>;
  completed: Array<{ publicKey: PublicKey; account: any }>;
};

export function ContractList() {
  const { contracts, getProgramAccount } = useFrontendProgram();
  const { publicKey } = useWallet();

  const contractGroups = useMemo(() => {
    if (!contracts.data) return new Map<string, ContractGroup>();

    const groups = new Map<string, ContractGroup>();

    contracts.data.forEach((contract) => {
      const recipient = contract.account.recipients[0].toString();
      if (!groups.has(recipient)) {
        groups.set(recipient, { recipient, active: [], completed: [] });
      }

      const group = groups.get(recipient)!;
      if (
        contract.account.paidTranches.toNumber() ===
        contract.account.trancheCount.toNumber()
      ) {
        group.completed.push(contract);
      } else {
        group.active.push(contract);
      }
    });

    return groups;
  }, [contracts.data]);

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
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>
            Program account not found. Make sure you are on the correct cluster.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="divide-y divide-base-200">
      {contracts.isLoading ? (
        <div className="flex items-center justify-center h-[200px]">
          <div className="loading loading-spinner loading-md text-primary"></div>
        </div>
      ) : contractGroups.size > 0 ? (
        Array.from(contractGroups.values()).map((group) => (
          <div key={group.recipient} className="py-4">
            <div className="container mx-auto px-4 lg:px-8">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-base-200">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-primary"
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
                <span className="text-sm text-base-content/70">Recipient:</span>
                <ExplorerLink
                  path={`account/${group.recipient}`}
                  label={ellipsify(group.recipient)}
                />
              </div>

              <div className="space-y-4">
                {group.active.length > 0 && (
                  <div>
                    <h4 className="text-base font-semibold mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      Active Contracts ({group.active.length})
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      {group.active.map((contract) => (
                        <ContractCard
                          key={contract.publicKey.toString()}
                          contract={contract.publicKey}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {group.completed.length > 0 && (
                  <div className="mt-8">
                    <h4 className="text-base font-semibold mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-success"></div>
                      Completed Contracts ({group.completed.length})
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      {group.completed.map((contract) => (
                        <ContractCard
                          key={contract.publicKey.toString()}
                          contract={contract.publicKey}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="py-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-base-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-base-content/50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>
          <h2 className="text-lg font-bold mt-3 mb-1">No Contracts Created</h2>
          <p className="text-sm text-base-content/70">
            Create your first payment contract using the form above.
          </p>
        </div>
      )}
    </div>
  );
}

export default function FrontendUi() {
  const { publicKey } = useWallet();
  const { programId } = useFrontendProgram();

  return publicKey ? (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      <AppHero
        title={
          <div className="flex items-center justify-center w-full">
            <h1 className="text-4xl font-bold text-center">
              Company Dashboard
            </h1>
          </div>
        }
        subtitle="Create and manage your payment contracts"
      >
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="text-base-content/70">Program ID:</span>
          <ExplorerLink
            path={`account/${programId}`}
            label={ellipsify(programId.toString())}
          />
        </div>
      </AppHero>
      <CreateContract />
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
