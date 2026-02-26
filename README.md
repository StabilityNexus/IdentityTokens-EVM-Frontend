<!-- Don't delete it -->
<div name="readme-top"></div>

<!-- Organization Logo -->
<div align="center" style="display: flex; align-items: center; justify-content: center; gap: 16px;">
  <img alt="Stability Nexus" src="public/stability.svg" width="175">
  <img src="public/assets/logo.svg" width="175" />
</div>

&nbsp;

<!-- Organization Name -->
<div align="center">

[![Static Badge](https://img.shields.io/badge/Stability_Nexus-DIT-228B22?style=for-the-badge&labelColor=FFC517)](https://dit.stability.nexus/)

</div>

<!-- Organization/Project Social Handles -->
<p align="center">
<!-- Telegram -->
<a href="https://t.me/StabilityNexus">
<img src="https://img.shields.io/badge/Telegram-black?style=flat&logo=telegram&logoColor=white&logoSize=auto&color=24A1DE" alt="Telegram Badge"/></a>
&nbsp;&nbsp;
<!-- X (formerly Twitter) -->
<a href="https://x.com/StabilityNexus">
<img src="https://img.shields.io/twitter/follow/StabilityNexus" alt="X (formerly Twitter) Badge"/></a>
&nbsp;&nbsp;
<!-- Discord -->
<a href="https://discord.gg/YzDKeEfWtS">
<img src="https://img.shields.io/discord/995968619034984528?style=flat&logo=discord&logoColor=white&logoSize=auto&label=Discord&labelColor=5865F2&color=57F287" alt="Discord Badge"/></a>
&nbsp;&nbsp;
<!-- Medium -->
<a href="https://news.stability.nexus/">
  <img src="https://img.shields.io/badge/Medium-black?style=flat&logo=medium&logoColor=black&logoSize=auto&color=white" alt="Medium Badge"></a>
&nbsp;&nbsp;
<!-- LinkedIn -->
<a href="https://linkedin.com/company/stability-nexus">
  <img src="https://img.shields.io/badge/LinkedIn-black?style=flat&logo=LinkedIn&logoColor=white&logoSize=auto&color=0A66C2" alt="LinkedIn Badge"></a>
&nbsp;&nbsp;
<!-- Youtube -->
<a href="https://www.youtube.com/@StabilityNexus">
  <img src="https://img.shields.io/youtube/channel/subscribers/UCZOG4YhFQdlGaLugr_e5BKw?style=flat&logo=youtube&logoColor=white&logoSize=auto&labelColor=FF0000&color=FF0000" alt="Youtube Badge"></a>
</p>

---

<div align="center">
<h1>Decentralized Identity Token (DIT)</h1>
</div>

[DIT](https://dit.stability.nexus/) is a portable, recoverable, and self-sovereign identity system built on EVM chains. Users can mint ERC-721 identity tokens and build an on-chain endorsement graph for trust and reputation.

---

## Project Maturity

- [x] The project has a logo.
- [x] The project has a favicon.
- [ ] The protocol:
  - [ ] has been described and formally specified in a paper.
  - [ ] has had its main properties mathematically proven.
  - [ ] has been formally verified.
- [ ] The smart contracts:
  - [ ] were thoroughly reviewed by at least two knights of The Stable Order.
  - [ ] were deployed to:
    - [ ] Ergo
    - [ ] Cardano
    - [ ] EVM Chains:
      - [ ] Ethereum Classic
      - [ ] Ethereum
      - [ ] Polygon
      - [ ] BSC
      - [ ] Base
- [ ] The web frontend:
  - [x] has proper title and metadata.
  - [ ] has proper open graph metadata, to ensure that it is shown well when shared in social media (Discord, Telegram, Twitter, LinkedIn).
  - [x] has a footer, containing the Stability Nexus's logo and pointing to the social media accounts of the Stability Nexus.
  - [ ] is fully static and client-side.
  - [ ] is deployed to Github Pages via a Github Workflow.
  - [ ] is accessible through the https://dit.stability.nexus domain.
- [ ] the project is listed in [https://stability.nexus/protocols](https://stability.nexus/protocols).

---

## Tech Stack

### Frontend

- [Next.js](https://nextjs.org/) 16 (React 19)
- [TypeScript](https://www.typescriptlang.org/)
- [TailwindCSS](https://tailwindcss.com/) v4
- [Framer Motion](https://www.framer.com/motion/) (animations)

### Blockchain / Web3

- [wagmi](https://wagmi.sh/) v2 (React hooks for Ethereum)
- [viem](https://viem.sh/) v2 (TypeScript interface for Ethereum)
- [RainbowKit](https://www.rainbowkit.com/) v2 (wallet connection UI)
- Solidity Smart Contracts (ERC-721)

---

## Getting Started

### Prerequisites

- **Node.js ≥20.9** (required by Next.js 16)
- npm (v10+)
- MetaMask or any other web3 wallet browser extension
- A [WalletConnect Project ID](https://cloud.reown.com/) (free)

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/StabilityNexus/IdentityTokens-EVM-Frontend.git
cd IdentityTokens-EVM-Frontend
```

#### 2. Install Dependencies

```bash
npm install
```

#### 3. Configure Environment Variables

Copy the example environment file and add your WalletConnect project ID:

```bash
cp .env.example .env.local
```

Edit `.env.local` and replace `your_project_id_here` with your actual project ID from [Reown (WalletConnect)](https://cloud.reown.com/).

#### 4. Run the Development Server

```bash
npm run dev
```

#### 5. Open your Browser

Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

---

## Contributing

We welcome contributions of all kinds! To contribute:

1. Fork the repository and create your feature branch (`git checkout -b feature/AmazingFeature`).
2. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
3. Run the development workflow commands to ensure code quality:
   - `npm run format` — auto-format all files with Prettier
   - `npm run check-format` — check formatting without writing
   - `npm run lint` — lint with ESLint
4. Push your branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request for review.

If you encounter bugs, need help, or have feature requests:

- Please open an issue in this repository providing detailed information.
- Describe the problem clearly and include any relevant logs or screenshots.

We appreciate your feedback and contributions!

© 2025 The Stable Order.
