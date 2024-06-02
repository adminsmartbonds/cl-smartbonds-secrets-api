import fs from "node:fs";

export interface ContractJson {
    bytecode: string;
    abi: string;
}

const CONTRACT_MANAGER_JSON_LOCATION = "src/contracts/SBAbstractFunctionsContractManager.json";
export const CONTRACT_MANAGER_DEF = JSON.parse(fs.readFileSync(CONTRACT_MANAGER_JSON_LOCATION, 'utf8')) as ContractJson;

/* --- Initialize the various constants we'll need in our function ---------- */

export const INFURA_KEY = process.env.INFURA_API_KEY;
if (!INFURA_KEY) {
    throw Error("INFURA API key not defined!");
}

export const SIGNING_KEY = process.env.SIGNING_KEY;
if (!SIGNING_KEY) {
    throw Error("Signing key not defined!");
}

export const GOOGLE_KEY = process.env.GOOGLE_API_KEY;
if (!GOOGLE_KEY) {
    throw new Error(`GOOGLE Secrets API Key not provided  - check your environment variables`)
}

interface BlockchainNetworkDefinition {
    chainId: string;
    routerAddress: string;
    donId: string;
    rpcUrl: string;
    contractManagerAddress: string;
}

function readKnownNetworks() {
    const knownNetworksEnv = process.env.KNOWN_NETWORKS;
    const result = new Map<bigint, BlockchainNetworkDefinition>;
    if (knownNetworksEnv) {
        try {
            const networkJSONArray = JSON.parse(knownNetworksEnv) as BlockchainNetworkDefinition[];

            for (const network of networkJSONArray) {
                result.set(BigInt(network.chainId), network);
            }
        } catch(err) {
            console.error("Could not read Network Definitions: ", err);
            throw Error("Error in the Network Definitions:");
        }
    }
    return result;
}

export const KNOWN_NETWORKS = readKnownNetworks();

