# Backend

Lightweight service to interact with the TON payment channel (APIs/bot helpers).

## Quick start
```bash
# from backend/
npm install

# development
npm run start:dev

# production
npm run start:prod
```

## Notes
- Uses NestJS with TypeScript.
- Talks to contracts in `../paymentChannel/` via wrappers and scripts.
