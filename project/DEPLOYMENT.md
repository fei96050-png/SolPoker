# BSC Poker - Deployment Guide

This guide will walk you through deploying the BSC Poker application to production.

## Prerequisites

1. **Node.js** (v16 or higher)
2. **npm** or **yarn**
3. **MetaMask** or another Web3 wallet
4. **BNB** for gas fees (testnet or mainnet)
5. **Supabase Account** (already configured)
6. **BSCScan API Key** (for contract verification)

## Step 1: Smart Contract Deployment

### 1.1 Install Hardhat

```bash
cd contracts
npm install --save-dev hardhat @nomiclabs/hardhat-waffle @nomiclabs/hardhat-etherscan ethers
```

### 1.2 Configure Environment

Create a `.env` file in the `contracts` directory:

```env
PRIVATE_KEY=your_wallet_private_key
BSCSCAN_API_KEY=your_bscscan_api_key
```

**⚠️ IMPORTANT**: Never commit your private key to version control!

### 1.3 Deploy to BSC Testnet

```bash
npx hardhat run scripts/deploy.js --network bscTestnet
```

This will:
- Deploy the PokerGame contract
- Display the contract address
- Attempt to verify the contract on BSCScan

### 1.4 Deploy to BSC Mainnet

```bash
npx hardhat run scripts/deploy.js --network bscMainnet
```

**⚠️ WARNING**: Deploying to mainnet will cost real BNB!

### 1.5 Update Environment Variables

Copy the deployed contract address and update your main `.env` file:

```env
VITE_CONTRACT_ADDRESS=0x...your_contract_address
```

## Step 2: Frontend Deployment

### 2.1 Build the Application

```bash
npm run build
```

This creates an optimized production build in the `dist` folder.

### 2.2 Deployment Options

#### Option A: Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel --prod
```

3. Set environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_CONTRACT_ADDRESS`

#### Option B: Netlify

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Deploy:
```bash
netlify deploy --prod --dir=dist
```

3. Set environment variables in Netlify dashboard

#### Option C: GitHub Pages

1. Add to `package.json`:
```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

2. Install gh-pages:
```bash
npm install --save-dev gh-pages
```

3. Deploy:
```bash
npm run deploy
```

#### Option D: Traditional Web Hosting

1. Build the project:
```bash
npm run build
```

2. Upload the `dist` folder to your web server

3. Configure your web server to:
   - Serve `index.html` for all routes (SPA routing)
   - Enable HTTPS
   - Set proper CORS headers

## Step 3: Database Configuration (Supabase)

The database is already configured with the migration. Verify:

1. Go to Supabase dashboard
2. Check that these tables exist:
   - `players`
   - `rooms`
   - `room_players`
   - `game_history`
   - `player_stats`

3. Verify RLS policies are enabled on all tables

## Step 4: Post-Deployment Checklist

- [ ] Smart contract deployed and verified
- [ ] Contract address updated in `.env`
- [ ] Frontend built and deployed
- [ ] Environment variables configured
- [ ] Database tables and RLS policies verified
- [ ] Wallet connection works on the live site
- [ ] Test creating a room on testnet
- [ ] Test joining a room
- [ ] Test game flow
- [ ] Language switcher works
- [ ] Twitter/X links are correct
- [ ] Profile page displays correctly
- [ ] Leaderboard populates with data

## Step 5: Security Hardening

### 5.1 Smart Contract
- [ ] Contract ownership verified
- [ ] Emergency withdraw tested
- [ ] Fee calculation verified (0.5%)
- [ ] Contract verified on BSCScan

### 5.2 Frontend
- [ ] Environment variables not exposed in client code
- [ ] HTTPS enabled
- [ ] Content Security Policy configured
- [ ] Rate limiting implemented

### 5.3 Database
- [ ] RLS policies tested
- [ ] API keys secured
- [ ] Backup strategy in place

## Step 6: Monitoring and Maintenance

### Contract Monitoring
- Monitor contract events using BSCScan
- Set up alerts for large transactions
- Track platform fees collected

### Frontend Monitoring
- Set up error tracking (Sentry, LogRocket)
- Monitor performance (Google Analytics)
- Track user engagement

### Database Monitoring
- Monitor Supabase dashboard for:
  - Database size
  - Active connections
  - Query performance
  - Real-time subscriptions

## Troubleshooting

### Contract Deployment Issues

**Error: Insufficient funds**
- Ensure you have enough BNB for gas fees
- BSC Testnet: Get free BNB from faucet
- BSC Mainnet: Purchase BNB

**Error: Network connection failed**
- Check RPC URL in hardhat.config.js
- Try alternative RPC endpoints

### Frontend Issues

**Wallet connection fails**
- Ensure MetaMask is installed
- Check network configuration
- Verify contract address is correct

**Build fails**
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear cache: `rm -rf .vite`
- Check for TypeScript errors: `npm run typecheck`

**3D table not rendering**
- Check browser WebGL support
- Verify Three.js dependencies installed
- Check console for errors

## Updating the Application

### Smart Contract Updates

⚠️ Smart contracts are immutable. To update:

1. Deploy new contract version
2. Update frontend to use new contract address
3. Migrate data if necessary
4. Announce changes to users

### Frontend Updates

1. Make changes to code
2. Test locally: `npm run dev`
3. Build: `npm run build`
4. Deploy: Follow deployment option above

### Database Updates

1. Create new migration in Supabase
2. Test on development database
3. Apply to production
4. Verify RLS policies still work

## Support and Resources

- **BSCScan Testnet**: https://testnet.bscscan.com
- **BSCScan Mainnet**: https://bscscan.com
- **BSC Testnet Faucet**: https://testnet.binance.org/faucet-smart
- **Supabase Docs**: https://supabase.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Hardhat Docs**: https://hardhat.org/docs

## Cost Estimates

### BSC Testnet
- Deployment: ~0.01 BNB (free from faucet)
- Transactions: Free

### BSC Mainnet
- Contract deployment: ~0.02-0.05 BNB ($6-15)
- Create room: ~0.001-0.002 BNB
- Join room: ~0.001-0.002 BNB
- Game actions: ~0.0005-0.001 BNB each

### Hosting (Monthly)
- Vercel/Netlify: Free tier available
- Supabase: Free tier (500MB DB, 50K users)
- Domain: ~$10-15/year

## Legal Considerations

⚠️ **IMPORTANT**: Online gambling laws vary by jurisdiction.

- Consult legal counsel before launching
- Implement age verification
- Add terms of service
- Include responsible gambling resources
- Consider licensing requirements
- Implement KYC/AML if required

## Next Steps After Deployment

1. **Marketing**
   - Announce on Twitter/X
   - Create promotional materials
   - Engage with crypto/gaming communities

2. **User Support**
   - Set up support channels
   - Create FAQ documentation
   - Monitor user feedback

3. **Analytics**
   - Track user acquisition
   - Monitor game statistics
   - Analyze platform fees collected

4. **Iteration**
   - Gather user feedback
   - Plan feature updates
   - Optimize performance
