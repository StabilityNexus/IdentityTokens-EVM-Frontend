# 🤝 Contributing to DIT (Frontend)

Welcome to the DIT frontend project 🚀

This repository is a **Next.js 16 + React 19 + Wagmi + RainbowKit** Web3 application.

Please follow this complete contribution guide from start to final PR merge.

---

# 📜 1️⃣ Core Contribution Rules

1. Get the issue assigned before starting work.
2. Discuss major UI/architecture changes before implementation.
3. Run lint and formatting before committing.
4. Ensure the app builds successfully.
5. Do NOT push directly to main.
6. Do NOT open PR without linking an issue.

Clean code and predictable workflow are mandatory.

---

# 🧭 2️⃣ Complete Contribution Workflow (Step-by-Step)

## 🔎 Step 1: Find or Create an Issue

- Check existing issues.
- If creating a new one, include:
  - Clear title
  - Problem description
  - Screenshots (if UI related)
  - Expected behavior

Do not start coding yet.

---

## 🙋 Step 2: Get Assigned

Comment:

"I would like to work on this issue."

Wait for assignment confirmation before starting.

---

## 🍴 Step 3: Fork the Repository

Click the **Fork** button on GitHub.

This creates your own copy under your account.

---

## 💻 Step 4: Clone Your Fork

```
git clone https://github.com/YOUR-USERNAME/IdentityTokens-EVM-Frontend.git
cd IdentityTokens-EVM-Frontend
```

---

## 🔗 Step 5: Add Upstream Remote

```
git remote add upstream https://github.com/StabilityNexus/IdentityTokens-EVM-Frontend.git
git remote -v
```

---

## 🌿 Step 6: Create a Feature Branch

Never work on main.

```
git checkout -b feature/short-description
```

Examples:

- feature/add-wallet-ui
- fix/navbar-overflow
- refactor/web3-hooks
- docs/update-readme

---

# 🛠 3️⃣ Project Setup

## 📦 Install Dependencies

```
npm install
```

This installs:

- Next.js 16
- React 19
- Wagmi
- RainbowKit
- Viem
- ESLint
- Prettier
- Husky
- TailwindCSS

---

## 🔐 Setup Git Hooks

Husky is used for pre-commit hooks.

If needed:

```
npm run prepare
```

On commit, lint-staged will automatically:

- Run eslint --fix on JS/TS files
- Run prettier --write

If commit fails, fix errors before retrying.

---

# 🚀 4️⃣ Development Commands

## ▶️ Start Development Server

```
npm run dev
```

App runs locally (usually [http://localhost:3000](http://localhost:3000)).

---

## 🏗 Build Project

```
npm run build
```

---

## 🚀 Start Production Server

```
npm run start
```

Build must succeed before PR.

---

# 🧹 5️⃣ Linting & Formatting (MANDATORY)

Before committing:

## 🔍 Run ESLint

```
npm run lint
```

## ✨ Format Code

```
npm run format
```

## ✅ Check Formatting

```
npm run check-format
```

PRs failing lint/format checks may be rejected.

---

# 🎨 Frontend Standards

## 🧱 Architecture Rules

- Use App Router properly (Next.js 16).
- Keep components small and reusable.
- Separate UI and Web3 logic.
- Use custom hooks for contract interactions.
- Avoid deeply nested components.

---

## 🔗 Web3 Integration Rules

Stack includes:

- Wagmi
- Viem
- RainbowKit
- MetaMask SDK
- WalletConnect
- React Query

Ensure:

- Wallet errors are handled.
- Loading states exist.
- Transactions show feedback.
- No private keys are exposed.

Test wallet connection manually before PR.

---

## 🎨 Styling Rules

- Use TailwindCSS v4.
- Avoid inline styles.
- Use tailwind-merge when combining classes.
- Maintain responsive design.
- Keep animations clean (Framer Motion).

---

# 7️⃣ Commit Properly

```
git add .
git commit -m "feat: short clear description"
```

Examples:

- feat: add rainbowkit wallet modal
- fix: resolve layout shift issue
- refactor: move web3 logic to hooks
- style: improve button hover states

Avoid vague messages like "update".

---

# 8️⃣ Sync With Upstream

Before pushing:

```
git fetch upstream
git merge upstream/main
```

Resolve conflicts locally.

---

# 9️⃣ Push Your Branch

```
git push origin feature/short-description
```

---

# 🔟 Open a Pull Request

When opening PR:

- Link issue (Closes #number)
- Explain what changed
- Add screenshots for UI changes
- Mention performance impact (if any)

PR must pass CI before review.

---

# ❌ What Causes Rejection

- No assignment
- Failing build
- Lint errors
- Poor code structure
- Breaking wallet flows
- No screenshots for UI changes

---

# 🤝 Code of Conduct

- Be professional
- Be logical
- Respect reviews
- Accept feedback constructively

We build structured Web3 interfaces. Quality matters.

---

# 📄 License

By contributing, you agree your work is licensed under the same license as this repository.

---

© 2026 The Stable Order
