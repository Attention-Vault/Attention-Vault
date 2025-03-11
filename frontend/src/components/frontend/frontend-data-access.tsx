"use client";

import { getFrontendProgram, getFrontendProgramId } from "@project/anchor";
import { useConnection } from "@solana/wallet-adapter-react";
import {
  Cluster,
  Keypair,
  PublicKey,
  LAMPORTS_PER_SOL,
  SystemProgram,
} from "@solana/web3.js";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import toast from "react-hot-toast";
import { useCluster } from "../cluster/cluster-data-access";
import { useAnchorProvider } from "../solana/solana-provider";
import { useTransactionToast } from "../ui/ui-layout";
import { BN } from "@coral-xyz/anchor";

export function useFrontendProgram() {
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  const programId = useMemo(
    () => getFrontendProgramId(cluster.network as Cluster),
    [cluster]
  );
  const program = useMemo(
    () => getFrontendProgram(provider, programId),
    [provider, programId]
  );

  const contracts = useQuery({
    queryKey: ["tranche-contracts", "all", { cluster }],
    queryFn: () => program.account.paymentContract.all(),
  });

  const getProgramAccount = useQuery({
    queryKey: ["get-program-account", { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  const createContract = useMutation({
    mutationKey: ["tranche-contract", "create", { cluster }],
    mutationFn: async ({
      keypair,
      totalAmount,
      trancheCount,
      recipients,
    }: {
      keypair: Keypair;
      totalAmount: number;
      trancheCount: number;
      recipients: PublicKey[];
    }) => {
      const lamports = totalAmount * LAMPORTS_PER_SOL;
      return program.methods
        .createContract(new BN(lamports), new BN(trancheCount), recipients)
        .accounts({
          contract: keypair.publicKey,
          owner: provider.wallet.publicKey,
          system_program: SystemProgram.programId,
        })
        .signers([keypair])
        .rpc();
    },
    onError: (error) => {
      console.error("Contract creation error:", error);
      const errorMessage = error.toString();
      if (errorMessage.includes("insufficient funds")) {
        toast.error("Insufficient funds to create contract");
      } else if (errorMessage.includes("InvalidRecipientsCount")) {
        toast.error("Number of recipients must match tranche count");
      } else if (errorMessage.includes("InvalidAmount")) {
        toast.error("Total amount must be greater than 0");
      } else if (errorMessage.includes("InvalidTrancheCount")) {
        toast.error("Tranche count must be greater than 0");
      } else {
        toast.error("Failed to create contract: " + errorMessage);
      }
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      return contracts.refetch();
    },
  });

  return {
    program,
    programId,
    contracts,
    getProgramAccount,
    createContract,
  };
}

export function useFrontendProgramContract({
  contractAddress,
}: {
  contractAddress: PublicKey;
}) {
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const { program, contracts } = useFrontendProgram();
  const provider = useAnchorProvider();

  const contractQuery = useQuery({
    queryKey: ["tranche-contract", "fetch", { cluster, contractAddress }],
    queryFn: () => program.account.paymentContract.fetch(contractAddress),
  });

  const closeContractMutation = useMutation({
    mutationKey: ["tranche-contract", "close", { cluster, contractAddress }],
    mutationFn: () =>
      program.methods
        .closeContract()
        .accounts({ contract: contractAddress })
        .rpc(),
    onSuccess: (tx) => {
      transactionToast(tx);
      return contracts.refetch();
    },
  });

  const distributeTranchesMutation = useMutation({
    mutationKey: [
      "tranche-contract",
      "distribute",
      { cluster, contractAddress },
    ],
    mutationFn: () => {
      const data = contractQuery.data;
      if (!data) throw new Error("Contract data not found");

      const currentRecipient = data.recipients[data.paidTranches.toNumber()];
      if (!currentRecipient) throw new Error("Recipient not found");

      return program.methods
        .distributeTranche()
        .accounts({
          contract: contractAddress,
          recipient: currentRecipient,
          owner: provider.wallet.publicKey,
        })
        .rpc();
    },
    onError: (error) => {
      console.error("Distribution error:", error);
      toast.error("Failed to distribute tranche: " + error.toString());
    },
    onSuccess: (tx) => {
      transactionToast(tx);
      return contractQuery.refetch();
    },
  });

  return {
    contractQuery,
    closeContractMutation,
    distributeTranchesMutation,
  };
}
