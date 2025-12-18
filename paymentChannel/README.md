# PaymentChannel

Contracts, wrappers, scripts, and tests for the TON payment channel.

## Structure
- **`contracts/`**: Tolk smart contracts for the payment channel.
- **`wrappers/`**: TypeScript wrappers and helpers for compile/serialization.
- **`scripts/`**: Task scripts (deploy, close, etc.).
- **`tests/`**: Contract tests.

## Quick start
```bash
# from paymentChannel/
npm install
npm test

# run scripts (examples)
npm run ts-node scripts/deployPaymentChannel.ts
npm run ts-node scripts/closePaymentChannel.ts
```

See `scripts/` for more utilities.
