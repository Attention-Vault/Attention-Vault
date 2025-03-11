"use client";

import { Keypair, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useMemo, useState } from "react";
import { ellipsify } from "../ui/ui-layout";
import { ExplorerLink } from "../cluster/cluster-ui";
import {
  useFrontendProgram,
  useFrontendProgramContract,
} from "./frontend-data-access";

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
          <div className="h-32 bg-base-300 rounded-lg"></div>
        </div>
      </div>
    );
  }

  const totalAmount = data.totalAmount.toNumber() / LAMPORTS_PER_SOL;
  const paidAmount = data.paidTranches.toNumber() * trancheAmount;
  const remainingAmount = totalAmount - paidAmount;
  const isCompleted =
    data.paidTranches.toNumber() === data.trancheCount.toNumber();

  return (
    <div className="bg-base-100 p-4 border-l-2 border-base-300 hover:border-primary transition-all duration-300 shadow-sm hover:shadow-md">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">
            {totalAmount.toFixed(2)} SOL Contract
          </h3>
          <div className="text-sm text-base-content/70">
            {trancheAmount.toFixed(2)} SOL per tranche
          </div>
        </div>
        <div
          className={`badge badge-md ${
            isCompleted ? "badge-success" : "badge-primary"
          }`}
        >
          {isCompleted ? "Completed" : "Active"}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">Progress</span>
            <span>
              {(
                (data.paidTranches.toNumber() / data.trancheCount.toNumber()) *
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

        <div className="grid grid-cols-2 gap-4">
          <div className="border-l-2 border-success/30 pl-3 py-2">
            <div className="text-sm text-base-content/70">Paid</div>
            <div className="font-semibold text-success">
              {paidAmount.toFixed(2)} SOL
            </div>
          </div>
          <div className="border-l-2 border-primary/30 pl-3 py-2">
            <div className="text-sm text-base-content/70">Remaining</div>
            <div className="font-semibold text-primary">
              {remainingAmount.toFixed(2)} SOL
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            className="btn btn-xs btn-primary flex-1"
            onClick={() => distributeTranchesMutation.mutateAsync()}
            disabled={distributeTranchesMutation.isPending || isCompleted}
          >
            Distribute Tranche
          </button>
          <button
            className="btn btn-xs btn-ghost btn-square"
            onClick={() => {
              if (
                !window.confirm("Are you sure you want to close this contract?")
              )
                return;
              closeContractMutation.mutateAsync();
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
        </div>

        <div className="text-xs space-y-1 pt-2 border-t border-base-200">
          <div className="flex justify-between items-center text-base-content/70">
            <span>Contract</span>
            <ExplorerLink
              path={`account/${contract}`}
              label={ellipsify(contract.toString())}
            />
          </div>
          <div className="flex justify-between items-center text-base-content/70">
            <span>Recipient</span>
            <ExplorerLink
              path={`account/${data.recipients[0]}`}
              label={ellipsify(data.recipients[0].toString())}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CreateContract() {
  const { createContract } = useFrontendProgram();
  const [totalAmount, setTotalAmount] = useState("");
  const [trancheCount, setTrancheCount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
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

    try {
      const recipientPubkey = new PublicKey(recipient.trim());
      const recipients = Array(tranches).fill(recipientPubkey);
      createContract.mutateAsync({
        keypair: Keypair.generate(),
        totalAmount: amount,
        trancheCount: tranches,
        recipients: recipients,
      });
    } catch (err) {
      setError("Invalid recipient address format");
    }
  };

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
              className="input input-bordered w-full bg-base-100"
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
              min="1"
              className="input input-bordered w-full bg-base-100"
              value={trancheCount}
              onChange={(e) => setTrancheCount(e.target.value)}
              placeholder="1"
            />
          </div>
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
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      Active Contracts
                    </h4>
                    <div className="grid md:grid-cols-2 gap-3">
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
                  <div>
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-success"></div>
                      Completed Contracts
                    </h4>
                    <div className="grid md:grid-cols-2 gap-3">
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
