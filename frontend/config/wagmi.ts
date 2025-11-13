import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { hardhat, sepolia } from "wagmi/chains";

// WalletConnect Project ID
const walletProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

if (!walletProjectId) {
  throw new Error(
    "Missing NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID environment variable.",
  );
}
export { walletProjectId };

// Infura API Key
const INFURA_API_KEY = process.env.NEXT_PUBLIC_INFURA_API_KEY || "zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz";

// Override hardhat chain to use localhost
const localhostChain = {
  ...hardhat,
  id: 31337,
  name: "Localhost",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["http://127.0.0.1:8545"],
    },
    public: {
      http: ["http://127.0.0.1:8545"],
    },
  },
};

export const wagmiConfig = getDefaultConfig({
  appName: "GhostVote",
  projectId: walletProjectId,
  chains: [localhostChain, sepolia],
  transports: {
    [localhostChain.id]: http("http://127.0.0.1:8545", {
      batch: false,
      timeout: 60000,
    }),
    [sepolia.id]: http(`https://sepolia.infura.io/v3/${INFURA_API_KEY}`),
  },
  ssr: true,
});

export const initialMockChains: Readonly<Record<number, string>> = {
  [localhostChain.id]: "http://127.0.0.1:8545",
};
