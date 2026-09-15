<!-- Don't delete it -->
<div name="readme-top"></div>

<!-- Organization Logo -->
<div align="center" style="display: flex; align-items: center; justify-content: center; gap: 16px;">
  <img alt="Stability Nexus" src="public/stability.svg" width="175">
  <img alt="Decentralized Identity Tokens Logo" src="public/logos/logo.svg" width="155" />
</div>

&nbsp;

<!-- Organization Name -->
<div align="center">

[![Static Badge](https://img.shields.io/badge/Stability_Nexus-/DIT-228B22?style=for-the-badge&labelColor=FFC517)](https://identity-tokens-evm-frontend.vercel.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

<!-- Correct deployed url to be added -->

</div>

<!-- Organization/Project Social Handles -->
<p align="center">
<!-- Telegram -->
<a href="https://t.me/StabilityNexus">
<img src="https://img.shields.io/badge/Telegram-black?style=flat&logo=telegram&logoColor=white&logoSize=auto&color=24A1DE" alt="Telegram Badge"/></a>
&nbsp;&nbsp;
<!-- Discord -->
<a href="https://discord.gg/YzDKeEfWtS">
<img src="https://img.shields.io/discord/1022871757289422898?style=flat&logo=discord&logoColor=white&logoSize=auto&label=Discord&labelColor=5865F2&color=57F287" alt="Discord Badge"/></a>
&nbsp;&nbsp;
<!-- Blogs -->
<a href="https://viewpoints.stability.nexus/">
  <img src="https://img.shields.io/badge/Stable_Viewpoints-Articles-2ea44f?style=flat&labelColor=facc15" alt="Stable Viewpoints"></a>
&nbsp;&nbsp;
<!-- LinkedIn -->
<a href="https://linkedin.com/company/stability-nexus">
  <img src="https://img.shields.io/badge/LinkedIn-black?style=flat&logo=LinkedIn&logoColor=white&logoSize=auto&color=0A66C2" alt="LinkedIn Badge"></a>
&nbsp;&nbsp;
</p>

---

<div align="center">
<h1>Decentralized Identity Tokens</h1>
</div>
Decentralized Identity Tokens let anyone create and own a digital identity on the blockchain - no government, no institution, no middleman required. Think of it like a passport you issue to yourself, stored permanently on-chain, that anyone in the world can attest to, vouching for its authenticity.

## 🚀 Features

- **Feature 1**: Create and own a digital identity on the blockchain
- **Feature 2**: No government, no institution, no middleman required
- **Feature 3**: Store identity permanently on-chain
- **Feature 4**: Anyone in the world can attest to it, vouching for its authenticity

---

## 💻 Tech Stack

### Frontend

- Next.js (App Router, Turbopack)
- React 19
- TypeScript
- TailwindCSS
- RainbowKit & Wagmi v2 / Viem

### Blockchain & Smart Contracts

- Solidity 0.8.24
- Foundry (Forge, Cast, Anvil)
- OpenZeppelin Contracts

---

# ✅ Project Checklist

## 📜 Deployed Smart Contracts

The official smart contracts for Decentralized Identity Tokens are deployed on **Ethereum Sepolia (v0.0.3)**:

| Contract           | Address                                      | Explorer Link                                                                                        |
| :----------------- | :------------------------------------------- | :--------------------------------------------------------------------------------------------------- |
| **IdentitySystem** | `0x82b049805626202D04c7450b386732B34180D634` | [View on Etherscan](https://sepolia.etherscan.io/address/0x82b049805626202D04c7450b386732B34180D634) |
| **ProfileSystem**  | `0x34bC039aD24cd2c13b093847612180FdbEAdC78a` | [View on Etherscan](https://sepolia.etherscan.io/address/0x34bC039aD24cd2c13b093847612180FdbEAdC78a) |

---

## 🔗 Repository Links

1. [Frontend](https://github.com/StabilityNexus/IdentityTokens-EVM-Frontend/)
2. [Smart Contracts](https://github.com/StabilityNexus/IdentityTokens-EVM-Contracts)

---

## 🏗️ Architecture & Workflow

To understand the development process, contribution flow, and project structure, please refer to the detailed workflow guide:

👉 [View Workflow](docs/workflow.md)

## 🔄 User Journeys

1. **Create Root Identity**:
   - Connect your Web3 wallet (MetaMask / Rainbow).
   - Enter your desired display name and click **Create Root Identity**.
   - Your wallet mints the non-transferable Root Identity token bound to your address.

2. **Mint Profile Token**:
   - Navigate to your identity dashboard.
   - Mint a Profile Token linked to your root identity.
   - Configure user profile metadata (avatar, bio, custom attributes).

3. **Attestations & Trust**:
   - Issue an attestation to another token by entering their token ID and validity duration.
   - Browse attestations to see who has vouched for a token and verify attestation validity.

---

## 🍀 Getting Started (Local Setup)

Follow this step-by-step guide to run and develop the frontend locally against an Anvil node or public testnet.

### Prerequisites

- **Node.js**: v18.x or higher
- **Package Manager**: `npm`, `pnpm`, or `yarn`
- **Foundry**: For local blockchain testing (`anvil`, `forge`, `cast`). Install via:
  ```bash
  curl -L https://foundry.paradigm.xyz | bash
  foundryup
  ```
- **Web3 Wallet**: MetaMask, Rabby, or any browser wallet.

---

### Step 1: Clone the Repository & Install Dependencies

```bash
git clone https://github.com/StabilityNexus/IdentityTokens-EVM-Frontend.git
cd IdentityTokens-EVM-Frontend

npm install
```

---

### Step 2: Configure Environment Variables

1. Copy `.env.example` to create your `.env.local` file:

   ```bash
   cp .env.example .env.local
   ```

2. Open `.env.local`:

   ```env
   # WalletConnect / Reown Project ID (free from https://cloud.reown.com/)
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=YOUR_PROJECT_ID

   # Contract Addresses (Defaults to Sepolia v0.0.3)
   NEXT_PUBLIC_IDENTITY_SYSTEM_ADDRESS=0x82b049805626202D04c7450b386732B34180D634
   NEXT_PUBLIC_PROFILE_SYSTEM_ADDRESS=0x34bC039aD24cd2c13b093847612180FdbEAdC78a
   ```

---

### Step 3: Choose Your Development Environment

#### Option A: Local Development with Anvil (Recommended — Instant & Zero Gas)

Running a local Anvil node allows you to test transactions instantly with 10,000 free test ETH.

1. **Start Anvil node in a separate terminal**:

   ```bash
   anvil --block-time 1
   ```

   _Anvil starts at `http://127.0.0.1:8545` with Chain ID `31337`._

2. **Deploy Contracts locally** (from your smart contracts repository):

   ```bash
   cd path/to/IdentityTokens-EVM-Contracts
   make deploy-anvil
   ```

   _Default deterministic local addresses:_
   - `IdentitySystem`: `0x5FbDB2315678afecb367f032d93F642f64180aa3`
   - `ProfileSystem`: `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`

3. **Update `.env.local` in this frontend repo**:

   ```env
   NEXT_PUBLIC_IDENTITY_SYSTEM_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
   NEXT_PUBLIC_PROFILE_SYSTEM_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
   ```

4. **Configure MetaMask for Anvil**:
   - **Add Network Manually**:
     - Network Name: `Anvil Localhost`
     - RPC URL: `http://127.0.0.1:8545`
     - Chain ID: `31337`
     - Currency Symbol: `ETH`
   - **Import Test Account**:
     - Account 1 Private Key: `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`
     - Account 2 Private Key: `0x5de4111afa1a4b94908f83103eb2f93f4e4e66e3e29f4561990a825b428b4a3a`

> ⚠️ **Troubleshooting MetaMask "Nonce too high" Error:**  
> When you restart `anvil`, block and nonce counters reset. If transactions remain pending or fail with nonce mismatch:  
> In MetaMask: Go to **Settings** -> **Advanced** -> Click **"Clear activity tab data"** (or **"Reset Account"**).

---

#### Option B: Anvil Sepolia Forking (Test Live State with Zero Gas)

To interact with already minted tokens and state on Sepolia without paying testnet gas, fork Sepolia locally:

```bash
anvil --fork-url https://ethereum-sepolia-rpc.publicnode.com
```

Keep the default Sepolia contract addresses in `.env.local`, and point MetaMask to `http://127.0.0.1:8545` (Chain ID `31337`).

---

#### Option C: Public Ethereum Sepolia or Polygon Testnets

Simply connect your wallet to **Ethereum Sepolia** or **Polygon**. Ensure your wallet has testnet gas from a faucet.

---

### Step 4: Start the Frontend

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. Connect your wallet using RainbowKit (select **Foundry** if testing on Anvil) and start interacting with Decentralized Identity Tokens!

---

## 📱 App Screenshots

TODO: Add screenshots showcasing your application

|              |              |              |
| ------------ | ------------ | ------------ |
| Screenshot 1 | Screenshot 2 | Screenshot 3 |

---

## 🙌 Contributing

⭐ Don't forget to star this repository if you find it useful! ⭐

Thank you for considering contributing to this project! Contributions are highly appreciated and welcomed. To ensure smooth collaboration, please refer to our [Contribution Guidelines](Contributing.md).

---

## ✨ Maintainers

- [Kanishk Sogani](https://github.com/KanishkSogani)
- [Khushal Agarwal](https://github.com/khushal1512)

---

## 📍 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 💪 Thanks To All Contributors

Thanks a lot for spending your time helping Decentralized Identity Tokens grow. Keep rocking 🥂

[![Contributors](https://contrib.rocks/image?repo=StabilityNexus/IdentityTokens-EVM-Frontend)](https://github.com/StabilityNexus/IdentityTokens-EVM-Frontend/graphs/contributors)

© 2025 Stable-Order
