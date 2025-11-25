# BSC Poker - Blockchain Texas Hold'em

A decentralized Texas Hold'em poker game built on Binance Smart Chain (BSC) with a 3D interface, supporting up to 6 players per room.

## Features

- **Blockchain-based**: Smart contract powered game on BSC
- **3D Interface**: Immersive 3D poker table built with Three.js
- **Multi-language**: Support for English and Chinese
- **Wallet Integration**: Connect with MetaMask and other Web3 wallets
- **Room System**: Create and join poker rooms with custom buy-ins
- **0.5% Platform Fee**: Automated fee collection on each game
- **Real-time Updates**: Live game synchronization with Supabase
- **Player Statistics**: Track wins, earnings, and performance
- **Leaderboard**: Compete with other players globally
- **Twitter/X Integration**: Share and connect socially

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Three.js** (@react-three/fiber, @react-three/drei) for 3D rendering
- **Tailwind CSS** for styling
- **i18next** for internationalization
- **React Router** for navigation
- **ethers.js** for blockchain interaction

### Backend
- **Supabase** for database and real-time features
- **Solidity** smart contracts
- **BSC (Binance Smart Chain)** blockchain

## Project Structure

```
.
├── contracts/
│   ├── PokerGame.sol          # Main smart contract
│   └── PokerGameABI.json      # Contract ABI
├── src/
│   ├── components/            # React components
│   │   ├── 3d/               # 3D components (poker table)
│   │   ├── Header.tsx        # Navigation and wallet
│   │   ├── Footer.tsx        # Footer with links
│   │   ├── Lobby.tsx         # Game lobby
│   │   ├── GameRoom.tsx      # Game interface
│   │   ├── GameControls.tsx  # Player controls
│   │   ├── CreateRoomModal.tsx
│   │   ├── Leaderboard.tsx
│   │   ├── Profile.tsx
│   │   └── Logo.tsx          # Custom logo component
│   ├── contexts/
│   │   └── Web3Context.tsx   # Web3 provider
│   ├── i18n/                 # Translations
│   │   ├── config.ts
│   │   └── locales/
│   │       ├── en.json       # English
│   │       └── zh.json       # Chinese
│   ├── lib/
│   │   └── supabase.ts       # Supabase client
│   ├── utils/
│   │   └── pokerLogic.ts     # Game logic
│   ├── App.tsx               # Main app component
│   └── main.tsx              # Entry point
└── ...
```

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd bsc-poker
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_CONTRACT_ADDRESS=your_deployed_contract_address
```

4. Deploy the smart contract:
- Deploy `contracts/PokerGame.sol` to BSC Testnet or Mainnet
- Update `VITE_CONTRACT_ADDRESS` in `.env`

5. Set up Supabase:
- The database schema has been automatically created
- Tables: players, rooms, room_players, game_history, player_stats
- RLS policies are already configured

## Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Building for Production

Build the project:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Smart Contract Deployment

### Prerequisites
- Install Hardhat or Truffle
- Configure BSC network in your deployment tool
- Have BNB for gas fees

### Deploy Steps

1. Compile the contract:
```bash
npx hardhat compile
```

2. Deploy to BSC Testnet:
```bash
npx hardhat run scripts/deploy.js --network bscTestnet
```

3. Verify on BSCScan:
```bash
npx hardhat verify --network bscTestnet DEPLOYED_CONTRACT_ADDRESS
```

4. Update `.env` with the deployed contract address

## Smart Contract Functions

- `createRoom(buyInAmount)` - Create a new poker room
- `joinRoom(roomId)` - Join an existing room
- `leaveRoom(roomId)` - Leave a room before game starts
- `transferChipsToPot(roomId, amount)` - Bet chips
- `endGame(roomId, winner)` - End game and distribute winnings
- `getRoom(roomId)` - Get room information
- `getPlayerChips(roomId, player)` - Get player's chip count

## Game Features

### Room Creation
- Set custom buy-in amount (minimum 0.01 BNB)
- Maximum 6 players per room
- Rooms are listed in the lobby

### Gameplay
- Texas Hold'em rules
- Pre-flop, flop, turn, river rounds
- Actions: Fold, Check, Call, Raise, All-in
- 3D animated table with cards and chips
- Real-time updates for all players

### Platform Fee
- 0.5% (5/1000) fee on each game pot
- Automatically deducted on game end
- Sent to contract owner address

### Statistics
- Total games played
- Total wins
- Win rate
- Total earnings
- Biggest pot won

## Network Configuration

### BSC Testnet
- Chain ID: 97 (0x61)
- RPC URL: https://data-seed-prebsc-1-s1.binance.org:8545/
- Block Explorer: https://testnet.bscscan.com

### BSC Mainnet
- Chain ID: 56 (0x38)
- RPC URL: https://bsc-dataseed.binance.org/
- Block Explorer: https://bscscan.com

## Language Support

Switch between English and Chinese using the language selector in the header. The language preference is saved to localStorage.

## Wallet Connection

Supported wallets:
- MetaMask
- Binance Chain Wallet
- WalletConnect (any compatible wallet)

## Social Features

- Twitter/X integration in header and footer
- Share game results (coming soon)
- Connect social accounts to profile (coming soon)

## Security Considerations

- Smart contract includes emergency withdraw function (owner only)
- RLS policies protect player data in Supabase
- Wallet signature required for all transactions
- Platform fee rate is immutable in contract

## Roadmap

- [ ] Tournament system
- [ ] Private rooms with passwords
- [ ] Chat system in game rooms
- [ ] Achievements and badges
- [ ] Mobile app (React Native)
- [ ] NFT avatars
- [ ] Referral program

## Support

For issues, questions, or contributions, please visit our Twitter/X: [@bscpoker](https://twitter.com/bscpoker)

## License

MIT License - see LICENSE file for details

## Disclaimer

This is a gambling application. Play responsibly. Check your local laws regarding online gambling before playing.
