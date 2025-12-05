PolyX – Gasless, on-chain Twitter-style app on Polygon Amoy
==========================================================

What this is
------------
PolyX is a minimal Twitter/X clone where all core actions (post, like, retweet, quote-tweet) are recorded on-chain on Polygon Amoy. Users never pay gas; a backend relayer with a sponsor wallet signs and sends every transaction. The repo is a monorepo with `contracts/`, `backend/`, and `frontend/`.

High-level architecture
-----------------------
- Smart contracts (`contracts/`) store posts, likes, retweets, and quotes. Events make indexing easy. Every write takes a `logicalUser` address so the chain reflects the actual actor even though the sponsor wallet pays gas.
- Backend (`backend/`) is a Node.js/TypeScript Express relayer. It holds the sponsor private key, connects to the PolyX contract, exposes REST endpoints, validates input, and submits transactions. All on-chain writes flow through here.
- Frontend (`frontend/`) is a Next.js app that feels like a modern social feed. It uses the backend APIs only (no direct chain writes) and supports wallet connection (Injected/WalletConnect). UI is glassy/3D-inspired.

Repo layout
-----------
- contracts/
  - contracts/PolyX.sol – core contract
  - hardhat.config.ts – Hardhat config for Amoy
  - scripts/deploy.ts – deployment helper
  - env.example – Amoy RPC + deployer key
- backend/
  - src/index.ts – Express server + relayer routes
  - src/contract.ts – contract bindings
  - src/types.ts – shared types
  - env.example – RPC, sponsor key, contract address, port
- frontend/
  - app/ (Next.js App Router)
  - components/ – feed, composer, wallet connect UI
  - lib/api.ts – REST client
  - env.example – backend URL and WalletConnect project id

Prerequisites
-------------
- Node.js 18+
- pnpm (recommended) or npm/yarn
- Polygon Amoy RPC URL (e.g., Alchemy/Infura/Ankr)
- A funded Amoy account for deployer/sponsor (0.1 test MATIC is plenty)
- WalletConnect Cloud project ID (for universal wallet connections)
  - Supports MetaMask, Rainbow, Coinbase Wallet, Trust, Zerion, Ledger via WalletConnect/RainbowKit.

Quick start
-----------
1) Install deps  
```bash
pnpm install --filter ./contracts --filter ./backend --filter ./frontend
```

2) Contracts – configure + deploy  
```bash
cd contracts
cp env.example .env
# fill AMOY_RPC_URL, DEPLOYER_PRIVATE_KEY
pnpm install
npx hardhat compile
npx hardhat run scripts/deploy.ts --network amoy
# copy the printed contract address
```

3) Backend – configure + run  
```bash
cd ../backend
cp env.example .env
# fill AMOY_RPC_URL, SPONSOR_PRIVATE_KEY, POLYX_CONTRACT_ADDRESS, PORT
pnpm install
pnpm dev
```

4) Frontend – configure + run  
```bash
cd ../frontend
cp env.example .env.local
# set NEXT_PUBLIC_BACKEND_URL (e.g., http://localhost:3001)
# set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
pnpm install
pnpm dev
```

Backend REST endpoints
----------------------
- POST `/api/tweet` – `{ text, user }` → creates a post, returns tx hash + postId
- POST `/api/like` – `{ postId, user }` → likes post
- POST `/api/retweet` – `{ postId, user }` → retweet (creates a retweet-type post)
- POST `/api/quote` – `{ postId, text, user }` → quote post with comment
- GET `/api/feed` – recent posts (reverse chronological)
- GET `/api/post/:id` – details for one post

Wallet connection
-----------------
- RainbowKit + WalletConnect enable MetaMask, Rainbow, Coinbase Wallet, Trust, Zerion, Ledger and any WalletConnect-compatible wallet.
- Wallet connection is used for identity; all writes still flow through the backend relayer, which pays gas with the sponsor key.

Security and notes
------------------
- The backend is a trusted relayer; lock down the server, rate-limit, and add auth as needed. Place the sponsor key in env only, never in the frontend.
- Inputs are length-checked; extend with stricter validation and spam controls for production.
- Feeds are assembled via on-chain reads; for scale, add an indexer/subgraph.

Testing checklist
-----------------
- Run `npx hardhat test` inside `contracts` (add tests as you extend).
- Hit backend routes with curl/Postman.
- Use the frontend to connect a wallet, post, like, retweet, and quote; verify tx hashes returned and reflected on-chain.

Assumptions
-----------
- Uses a single PolyX contract on Amoy.
- Sponsor wallet pays gas for every write; logical user address is included in contract calls.
- Wallet connection is for identity/display; writes still go through backend.

Next steps (if you extend)
--------------------------
- Add pagination and indexing via events.
- Add auth/rate-limits and per-user quotas.
- Add ENS-like profile metadata, images, and richer media handling.
- Add optimistic UI and activity toasts for transactions.

