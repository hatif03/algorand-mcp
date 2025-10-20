import {
  ActionPanel,
  Action,
  Detail,
  showToast,
  Toast,
  Icon,
  useNavigation,
  confirmAlert,
  Alert,
} from "@raycast/api";
import { useState, useEffect } from "react";
import { WalletService, WalletData } from "./services/wallet-service";
import SendAlgo from "./send-algo";
import CreateAsset from "./create-asset";
import TransactionHistory from "./transaction-history";
import ExportWallet from "./export-wallet";
import AssetInfo from "./asset-info";
import SwapAssets from "./swap-assets";
import TransferAsset from "./transfer-asset";

export default function WalletInfo() {
  const [isLoading, setIsLoading] = useState(true);
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [accountInfo, setAccountInfo] = useState<any>(null);
  const [detailedAssets, setDetailedAssets] = useState<any[]>([]);
  const { push } = useNavigation();
  const walletService = WalletService.getInstance();

  useEffect(() => {
    loadWalletInfo();
  }, []);

  const loadWalletInfo = async () => {
    setIsLoading(true);
    try {
      const wallet = await walletService.getOrCreateWallet();
      setWalletData(wallet);
      
      try {
        const info = await walletService.getAccountInfo(wallet.address);
        setAccountInfo(info);
        
        // Fetch detailed asset information
        const assets = await walletService.getDetailedAccountAssets(wallet.address);
        setDetailedAssets(assets);
      } catch (error) {
        // Account not found on testnet - this is normal for new wallets
        setAccountInfo(null);
        setDetailedAssets([]);
      }
    } catch (error) {
      console.error("Error loading wallet:", error);
      await showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: error instanceof Error ? error.message : "Failed to load wallet",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAccountInfo = async () => {
    if (!walletData) return;

    setIsLoading(true);
    try {
      await showToast({
        style: Toast.Style.Animated,
        title: "Refreshing...",
        message: "Getting latest account information",
      });

      const info = await walletService.getAccountInfo(walletData.address);
      setAccountInfo(info);
      
      // Fetch detailed asset information
      const assets = await walletService.getDetailedAccountAssets(walletData.address);
      setDetailedAssets(assets);

      await showToast({
        style: Toast.Style.Success,
        title: "Updated!",
        message: "Account information refreshed",
      });
    } catch (error) {
      console.error("Error refreshing account info:", error);
      await showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: "Account not found on testnet. Try funding it first.",
      });
      setAccountInfo(null);
      setDetailedAssets([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fundTestnet = async () => {
    if (!walletData) return;

    setIsLoading(true);
    try {
      await showToast({
        style: Toast.Style.Animated,
        title: "Funding Account...",
        message: "Requesting funds from Algorand testnet faucet",
      });

      const result = await walletService.fundTestnet(walletData.address);
      
      await showToast({
        style: Toast.Style.Success,
        title: "Testnet Funded!",
        message: `Received ${result.amount / 1000000} ALGO from testnet faucet`,
      });

      // Refresh account info after funding
      setTimeout(() => refreshAccountInfo(), 2000);
    } catch (error) {
      console.error("Error funding testnet:", error);
      await showToast({
        style: Toast.Style.Failure,
        title: "Funding Failed",
        message: error instanceof Error ? error.message : "Failed to fund testnet account",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetWallet = async () => {
    const confirmed = await confirmAlert({
      title: "Reset Wallet",
      message: "This will permanently delete your current wallet and create a new one. Make sure you have backed up your mnemonic phrase!",
      primaryAction: {
        title: "Reset Wallet",
        style: Alert.ActionStyle.Destructive,
      },
      dismissAction: {
        title: "Cancel",
        style: Alert.ActionStyle.Cancel,
      },
    });

    if (confirmed) {
      setIsLoading(true);
      try {
        walletService.clearCache();
        await loadWalletInfo();
        await showToast({
          style: Toast.Style.Success,
          title: "Wallet Reset",
          message: "New wallet created successfully",
        });
      } catch (error) {
        await showToast({
          style: Toast.Style.Failure,
          title: "Error",
          message: "Failed to reset wallet",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getBalanceDisplay = () => {
    if (!accountInfo) return "0 ALGO (Account not on testnet)";
    const balance = accountInfo.amount / 1000000;
    return `${balance.toFixed(6)} ALGO`;
  };

  const getAssetsDisplay = () => {
    if (!detailedAssets || detailedAssets.length === 0) {
      return "No assets found";
    }

    return detailedAssets.map((asset: any) => {
      const frozenStatus = asset.isFrozen ? " (FROZEN)" : "";
      const url = asset.url ? ` | URL: ${asset.url}` : "";
      return `🪙 ${asset.name} (${asset.unitName})
   ID: ${asset.id}
   Balance: ${asset.formattedAmount} ${asset.unitName}${frozenStatus}
   Total Supply: ${(asset.total / Math.pow(10, asset.decimals)).toLocaleString()}
   Creator: ${asset.creator}${url}`;
    }).join("\n\n");
  };

  const markdown = `# 🔐 Your Algorand Wallet

${
  !walletData
    ? `## Loading wallet information...`
    : `
## 📍 Wallet Address
\`\`\`
${walletData.address}
\`\`\`

## 💰 Balance
**${getBalanceDisplay()}**

${accountInfo ? `
### Account Details
- **Minimum Balance**: ${(accountInfo["min-balance"] / 1000000).toFixed(6)} ALGO
- **Total Apps Opted In**: ${accountInfo["total-apps-opted-in"] || 0}
- **Total Assets Opted In**: ${accountInfo["total-assets-opted-in"] || 0}
- **Total Created Assets**: ${accountInfo["total-created-assets"] || 0}
- **Total Created Apps**: ${accountInfo["total-created-apps"] || 0}

### 🎯 Assets (${detailedAssets.length})
\`\`\`
${getAssetsDisplay()}
\`\`\`
` : `
### ⚠️ Account Status
This account is not yet active on the Algorand testnet. Fund it to get started!
`}

## 🔑 Wallet Details
- **Created**: ${new Date(walletData.createdAt).toLocaleString()}
- **Network**: Algorand Testnet
- **Status**: ${accountInfo ? "Active" : "Not Funded"}

---

### 🌐 External Links
- [View on AlgoExplorer](https://testnet.algoexplorer.io/address/${walletData.address})
- [Algorand Developer Portal](https://developer.algorand.org/)

### 🛡️ Security Notice
Your wallet is encrypted and stored securely on this device. The mnemonic phrase is your wallet's master key - keep it safe!
`
}`;

  return (
    <Detail
      navigationTitle="Algorand Wallet Info"
      isLoading={isLoading}
      markdown={markdown}
      actions={
        walletData && (
          <ActionPanel>
            <ActionPanel.Section title="Wallet Actions">
              <Action.CopyToClipboard
                title="Copy Address"
                content={walletData.address}
                icon={Icon.CopyClipboard}
              />
              <Action.CopyToClipboard
                title="Copy Mnemonic"
                content={walletData.mnemonic}
                icon={Icon.Key}
                shortcut={{ modifiers: ["cmd"], key: "m" }}
              />
              <Action
                title="Refresh Balance"
                onAction={refreshAccountInfo}
                icon={Icon.ArrowClockwise}
                shortcut={{ modifiers: ["cmd"], key: "r" }}
              />
            </ActionPanel.Section>
            
            <ActionPanel.Section title="Testnet Actions">
              <Action
                title="Fund Testnet Account"
                onAction={fundTestnet}
                icon={Icon.BankNote}
                shortcut={{ modifiers: ["cmd"], key: "f" }}
              />
            </ActionPanel.Section>

            <ActionPanel.Section title="Quick Actions">
              <Action.Push
                title="Send ALGO"
                target={<SendAlgo arguments={{ toAddress: "", amount: "", note: "" }} />}
                icon={Icon.ArrowRight}
                shortcut={{ modifiers: ["cmd"], key: "s" }}
              />
              <Action.Push
                title="Swap Assets"
                target={<SwapAssets />}
                icon={Icon.TwoArrowsClockwise}
                shortcut={{ modifiers: ["cmd"], key: "x" }}
              />
              <Action.Push
                title="Create Asset"
                target={<CreateAsset />}
                icon={Icon.Plus}
                shortcut={{ modifiers: ["cmd"], key: "c" }}
              />
              <Action.Push
                title="Transfer Asset"
                target={<TransferAsset arguments={{ toAddress: "", assetId: "", amount: "" }} />}
                icon={Icon.ArrowUpRight}
                shortcut={{ modifiers: ["cmd"], key: "t" }}
              />
              <Action.Push
                title="Transaction History"
                target={<TransactionHistory />}
                icon={Icon.List}
                shortcut={{ modifiers: ["cmd"], key: "h" }}
              />
              <Action.Push
                title="Asset Info"
                target={<AssetInfo arguments={{ assetId: "" }} />}
                icon={Icon.Info}
                shortcut={{ modifiers: ["cmd"], key: "i" }}
              />
            </ActionPanel.Section>

            {detailedAssets.length > 0 && (
              <ActionPanel.Section title="Your Assets">
                {detailedAssets.slice(0, 5).map((asset) => (
                  <Action.Push
                    key={asset.id}
                    title={`${asset.name} (${asset.formattedAmount} ${asset.unitName})`}
                    target={<AssetInfo arguments={{ assetId: asset.id.toString() }} />}
                    icon={Icon.Coins}
                  />
                ))}
                {detailedAssets.length > 5 && (
                  <Action
                    title={`... and ${detailedAssets.length - 5} more assets`}
                    onAction={() => {}}
                    icon={Icon.Ellipsis}
                  />
                )}
              </ActionPanel.Section>
            )}

            <ActionPanel.Section title="Advanced">
              <Action.Push
                title="Export Wallet"
                target={<ExportWallet />}
                icon={Icon.Download}
                shortcut={{ modifiers: ["cmd"], key: "e" }}
              />
              <Action
                title="Reset Wallet"
                onAction={resetWallet}
                icon={Icon.Trash}
                style={Action.Style.Destructive}
                shortcut={{ modifiers: ["cmd", "shift"], key: "r" }}
              />
            </ActionPanel.Section>
          </ActionPanel>
        )
      }
    />
  );
}