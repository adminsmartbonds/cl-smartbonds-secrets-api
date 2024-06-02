import {Request, Response} from "express";
import {ethers} from "ethers5";
import {CONTRACT_MANAGER_DEF, GOOGLE_KEY, INFURA_KEY, KNOWN_NETWORKS, SIGNING_KEY} from "./defaults.js";

const { SecretsManager } = await import("./secrets-manager/SecretsManager.cjs");

export async function renewSecrets(req: Request, res: Response) {
    // hardcoded for Sepolia
    const gatewayUrls = [
        "https://01.functions-gateway.testnet.chain.link/",
        "https://02.functions-gateway.testnet.chain.link/",
    ]
    for (const network of KNOWN_NETWORKS.values()) {
        // Initialize ethers signer and provider to interact with the contracts onchain
        if (network.routerAddress === "") {
            throw new Error("Private key not provided or network unknown use 'fuji' or 'sepolia'");
        }

        if (!network.rpcUrl) {
            throw new Error(`INFURA RPC URL not provided  - check your environment variables`)
        }
        const secrets = { apiKey: GOOGLE_KEY }
        const rpcProvider = new ethers.providers.JsonRpcProvider(`${network.rpcUrl}${INFURA_KEY}`);
        const wallet = new ethers.Wallet(SIGNING_KEY!, rpcProvider);

        // First encrypt secrets and upload the encrypted secrets to the DON
        const secretsManager = new SecretsManager({
            signer: wallet,
            functionsRouterAddress: network.routerAddress,
            donId: network.donId,
        })
        await secretsManager.initialize()

        // Encrypt secrets and upload to DON
        const encryptedSecretsObj = await secretsManager.encryptSecrets(secrets)
        const slotIdNumber = 0 // slot ID where to upload the secrets
        const expirationTimeMinutes = 1440 // expiration time in minutes of the secrets, 1 month


        console.log(
            `Uploading encrypted secret to gateways ${gatewayUrls}. slotId ${slotIdNumber}. Expiration in minutes: ${expirationTimeMinutes}`
        )
        // Upload secrets
        const uploadResult = await secretsManager.uploadEncryptedSecretsToDON({
            encryptedSecretsHexstring: encryptedSecretsObj.encryptedSecrets,
            gatewayUrls: gatewayUrls,
            slotId: slotIdNumber,
            minutesUntilExpiration: expirationTimeMinutes,
        })

        if (!uploadResult.success)
            throw new Error(`Encrypted secrets not uploaded to ${gatewayUrls}`)

        console.log(`Secrets uploaded secret version is: ${uploadResult.version}`)

        const donHostedSecretsVersion = uploadResult.version // fetch the reference of the encrypted secrets
        try {
            const rpcProvider = new ethers.providers.JsonRpcProvider(`${network.rpcUrl}${INFURA_KEY}`);
            const wallet = new ethers.Wallet(SIGNING_KEY!, rpcProvider);

            // ContractFactory to generate a contract
            const contractMgr = new ethers.Contract(network.contractManagerAddress, CONTRACT_MANAGER_DEF.abi, wallet);
            const txResponse = await contractMgr.setSecretVersion(donHostedSecretsVersion);

            if (txResponse) {
                await txResponse.wait();
                console.log(`Successfully uploaded new secret to contract manager at address ${network.contractManagerAddress} for chain ${network.chainId}`);
            }
        } catch (errNotify) {
            console.error("Could not update contract manager: ", errNotify);
            res.status(500).send();
        }
    }
    res.status(200).send();
}
