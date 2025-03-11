"use client";

import { Keypair, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useMemo, useState } from "react";
import { ellipsify } from "../ui/ui-layout";
import { ExplorerLink } from "../cluster/cluster-ui";
import {
  useFrontendProgram,
  useFrontendProgramContract,
} from "./frontend-data-access";

export function CreateContract() {
  const { createContract } = useFrontendProgram();
  const [totalAmount, setTotalAmount] = useState("");
  const [trancheCount, setTrancheCount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate inputs
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
      // Create an array with the same recipient repeated trancheCount times
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

  const trancheAmount = useMemo(() => {
    const amount = parseFloat(totalAmount);
    const tranches = parseInt(trancheCount);
    if (!isNaN(amount) && !isNaN(tranches) && tranches > 0) {
      return (amount / tranches).toFixed(4);
    }
    return "0";
  }, [totalAmount, trancheCount]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Total Amount (SOL)</label>
        <input
          type="number"
          step="0.1"
          min="0"
          className="input input-bordered w-full"
          value={totalAmount}
          onChange={(e) => setTotalAmount(e.target.value)}
          placeholder="Enter total amount in SOL"
        />
      </div>
      <div>
        <label className="label">Number of Tranches</label>
        <input
          type="number"
          min="1"
          className="input input-bordered w-full"
          value={trancheCount}
          onChange={(e) => setTrancheCount(e.target.value)}
          placeholder="Enter number of tranches to split payment into"
        />
      </div>
      {totalAmount && trancheCount && (
        <div className="alert alert-info">
          Each tranche will pay out {trancheAmount} SOL
        </div>
      )}
      <div>
        <label className="label">Recipient Address</label>
        <input
          type="text"
          className="input input-bordered w-full"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="Enter the recipient's Solana address"
        />
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      <button
        type="submit"
        className="btn btn-primary w-full"
        disabled={createContract.isPending}
      >
        Create Contract {createContract.isPending && "..."}
      </button>
    </form>
  );
}

export function ContractList() {
  const { contracts, getProgramAccount } = useFrontendProgram();

  if (getProgramAccount.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>;
  }
  if (!getProgramAccount.data?.value) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>
          Program account not found. Make sure you have deployed the program and
          are on the correct cluster.
        </span>
      </div>
    );
  }
  return (
    <div className={"space-y-6"}>
      {contracts.isLoading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : contracts.data?.length ? (
        <div className="grid md:grid-cols-2 gap-4">
          {contracts.data?.map((contract) => (
            <ContractCard
              key={contract.publicKey.toString()}
              contract={contract.publicKey}
            />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <h2 className={"text-2xl"}>No contracts</h2>
          No contracts found. Create one above to get started.
        </div>
      )}
    </div>
  );
}

function ContractCard({ contract }: { contract: PublicKey }) {
  const { contractQuery, closeContractMutation, distributeTranchesMutation } =
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
    return <span className="loading loading-spinner loading-lg"></span>;
  }

  return (
    <div className="card card-bordered border-base-300 border-4 text-neutral-content">
      <div className="card-body items-center text-center">
        <div className="space-y-6">
          <h2 className="card-title justify-center text-3xl">
            {data.totalAmount.toNumber() / LAMPORTS_PER_SOL} SOL
          </h2>
          <div className="space-y-2">
            <p>Tranches: {data.trancheCount.toString()}</p>
            <p>Paid: {data.paidTranches.toString()}</p>
            <p>Per Tranche: {trancheAmount} SOL</p>
          </div>
          <div className="card-actions justify-around">
            <button
              className="btn btn-primary"
              onClick={() => distributeTranchesMutation.mutateAsync()}
              disabled={
                distributeTranchesMutation.isPending ||
                data.paidTranches.toNumber() >= data.trancheCount.toNumber()
              }
            >
              Distribute Next Tranche
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => {
                if (
                  !window.confirm(
                    "Are you sure you want to close this contract?"
                  )
                )
                  return;
                closeContractMutation.mutateAsync();
              }}
              disabled={closeContractMutation.isPending}
            >
              Close Contract
            </button>
          </div>
          <div className="text-center space-y-4">
            <div className="space-y-2">
              <p>
                <span className="font-bold">Contract: </span>
                <ExplorerLink
                  path={`account/${contract}`}
                  label={ellipsify(contract.toString())}
                />
              </p>
              <p>
                <span className="font-bold">Recipient: </span>
                <ExplorerLink
                  path={`account/${data.recipients[0]}`}
                  label={ellipsify(data.recipients[0].toString())}
                />
              </p>
              <div className="mt-4">
                <p className="font-bold mb-2">Payment Progress:</p>
                <div className="flex gap-1 justify-center flex-wrap">
                  {Array(data.trancheCount.toNumber())
                    .fill(0)
                    .map((_, index) => (
                      <span
                        key={index}
                        className={`w-3 h-3 rounded-full ${
                          index < data.paidTranches.toNumber()
                            ? "bg-success"
                            : "bg-base-300"
                        }`}
                        title={`Tranche ${index + 1}`}
                      />
                    ))}
                </div>
                <p className="mt-2 text-sm">
                  {data.paidTranches.toNumber()} of{" "}
                  {data.trancheCount.toNumber()} tranches paid
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
