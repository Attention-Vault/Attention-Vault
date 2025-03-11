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
    <div className="max-w-4xl mx-auto">
      <div className="hero py-[64px]">
        <div className="hero-content text-center">
          <WalletButton />
        </div>
      </div>
    </div>
  );
}
