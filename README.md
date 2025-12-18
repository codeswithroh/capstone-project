# TON Payment Channel

A minimal end-to-end project demonstrating an off-chain payment channel on The Open Network (TON), with smart contracts, scripts, tests, and a lightweight backend service.

## What’s inside
- **`paymentChannel/`**: Tolk contracts, TypeScript wrappers, scripts, and tests for the channel logic.
- **`backend/`**: Simple service (e.g. API/bot helpers) to interact with the channel and TON.

## Quick start
- Contracts & scripts
  - Navigate to `paymentChannel/`
  - Install deps and run tests:
    ```bash
    npm install
    npm test
    ```
  - Run scripts (examples):
    ```bash
    npm run ts-node scripts/deployPaymentChannel.ts
    npm run ts-node scripts/closePaymentChannel.ts
    ```
- Backend
  - Navigate to `backend/`
  - Install deps and start dev server:
    ```bash
    npm install
    npm run start:dev
    ```

## Notes
- Contracts are written in Tolk and wrapped in TypeScript for easy integration.
- Scripts cover deploy, update state, and channel close flows.
- Tests validate core payment-channel behaviors.
