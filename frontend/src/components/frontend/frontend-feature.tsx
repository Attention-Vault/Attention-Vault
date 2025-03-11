"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletButton } from "../solana/solana-provider";
import { AppHero, ellipsify } from "../ui/ui-layout";
import { ExplorerLink } from "../cluster/cluster-ui";
import { useFrontendProgram } from "./frontend-data-access";
import { CreateContract, ContractList } from "./frontend-ui";

export default function FrontendFeature() {
  const { publicKey } = useWallet();
  const { programId } = useFrontendProgram();

  return publicKey ? (
    <div>
      <AppHero
        title="Tranche Payment System"
        subtitle={
          "Create a new payment contract by specifying the total amount, number of tranches, and recipient addresses. The contract will automatically distribute the payment in equal tranches to the specified recipients."
        }
      >
        <p className="mb-6">
          <ExplorerLink
            path={`account/${programId}`}
            label={ellipsify(programId.toString())}
          />
        </p>
        <CreateContract />
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
