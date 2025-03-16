"use client";

import { clusterApiUrl, Connection } from "@solana/web3.js";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { createContext, ReactNode, useContext, useEffect } from "react";
import toast from "react-hot-toast";

export interface Cluster {
  name: string;
  endpoint: string;
  network?: ClusterNetwork;
  active?: boolean;
}

export enum ClusterNetwork {
  SonicDevnet = "sonic-devnet",
}

// By default, we only configure the sonic-devnet cluster
export const defaultClusters: Cluster[] = [
  {
    name: "sonic-devnet",
    endpoint: "https://api.testnet.sonic.game",
    network: ClusterNetwork.SonicDevnet,
  },
];

const clusterAtom = atomWithStorage<Cluster>(
  "solana-cluster",
  defaultClusters[0]
);
const clustersAtom = atomWithStorage<Cluster[]>(
  "solana-clusters",
  defaultClusters
);

const activeClustersAtom = atom<Cluster[]>((get) => {
  const clusters = get(clustersAtom);
  const cluster = get(clusterAtom);
  return clusters.map((item) => ({
    ...item,
    active: item.name === cluster.name,
  }));
});

const activeClusterAtom = atom<Cluster>((get) => {
  const clusters = get(activeClustersAtom);

  return clusters.find((item) => item.active) || clusters[0];
});

export interface ClusterProviderContext {
  cluster: Cluster;
  clusters: Cluster[];
  setCluster: (cluster: Cluster) => void;
  getExplorerUrl(path: string): string;
}

const Context = createContext<ClusterProviderContext>(
  {} as ClusterProviderContext
);

export function ClusterProvider({ children }: { children: ReactNode }) {
  const cluster = useAtomValue(activeClusterAtom);
  const clusters = useAtomValue(activeClustersAtom);
  const setCluster = useSetAtom(clusterAtom);
  const setClusters = useSetAtom(clustersAtom);

  // Force only sonic-devnet cluster
  useEffect(() => {
    if (
      clusters.length !== 1 ||
      clusters[0].network !== ClusterNetwork.SonicDevnet
    ) {
      console.log("Resetting to sonic-devnet only...");
      setClusters(defaultClusters);
      setCluster(defaultClusters[0]);
    }
  }, [clusters, setClusters, setCluster]);

  console.log("Current cluster:", cluster);
  console.log("Available clusters:", clusters);

  const value: ClusterProviderContext = {
    cluster,
    clusters: [defaultClusters[0]], // Only return sonic-devnet
    setCluster: (cluster: Cluster) => {
      // Only allow setting to sonic-devnet
      if (cluster.network === ClusterNetwork.SonicDevnet) {
        console.log("Setting active cluster:", cluster);
        setCluster(cluster);
      }
    },
    getExplorerUrl: (path: string) =>
      `https://explorer.sonic.game/${path}?cluster=testnet.v1`,
  };
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useCluster() {
  return useContext(Context);
}

function getClusterUrlParam(cluster: Cluster): string {
  let suffix = "";
  switch (cluster.network) {
    case ClusterNetwork.SonicDevnet:
      suffix = "sonic-devnet";
      break;
    default:
      suffix = `custom&customUrl=${encodeURIComponent(cluster.endpoint)}`;
      break;
  }

  return suffix.length ? `?cluster=${suffix}` : "";
}
