import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PokerTable3D } from './3d/PokerTable';
import { GameControls } from './GameControls';
import { useWeb3 } from '../contexts/Web3Context';
import { getRoomPlayers, subscribeToRoom, RoomPlayer } from '../lib/supabase';
import { Coins, Users, Trophy } from 'lucide-react';

interface GameRoomProps {
  roomId: string;
}

export function GameRoom({ roomId }: GameRoomProps) {
  const { t } = useTranslation();
  const { account } = useWeb3();
  const [players, setPlayers] = useState<RoomPlayer[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<number>(0);
  const [pot, setPot] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlayers();

    const subscription = subscribeToRoom(roomId, (payload) => {
      console.log('Room update:', payload);
      loadPlayers();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [roomId]);

  async function loadPlayers() {
    const roomPlayers = await getRoomPlayers(roomId);
    setPlayers(roomPlayers);
    setLoading(false);
  }

  const seats = Array(6).fill(null).map((_, index) => {
    const player = players.find(p => p.seat_position === index);
    return {
      occupied: !!player,
      isDealer: index === 0,
      player: player || null
    };
  });

  const isPlayerInGame = players.some(p => p.wallet_address === account);
  const myTurn = players[currentPlayer]?.wallet_address === account;

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-gray-900 to-black">
      <div className="flex-1 relative">
        <div className="absolute inset-0">
          <PokerTable3D seats={seats} showCommunityCards={true} />
        </div>

        <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
          <div className="bg-black/60 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Users className="text-blue-400" size={20} />
                <div>
                  <div className="text-xs text-gray-400">{t('room.info.players')}</div>
                  <div className="text-white font-bold">{players.length} / 6</div>
                </div>
              </div>

              <div className="flex items-center gap-2 border-l border-gray-600 pl-4">
                <Coins className="text-amber-400" size={20} />
                <div>
                  <div className="text-xs text-gray-400">{t('room.info.pot')}</div>
                  <div className="text-amber-400 font-bold">{pot.toFixed(2)} BNB</div>
                </div>
              </div>
            </div>
          </div>

          {myTurn && (
            <div className="bg-green-600/80 backdrop-blur-sm rounded-lg px-6 py-3 border border-green-400 animate-pulse">
              <div className="text-white font-bold">{t('game.status.yourTurn')}</div>
            </div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-10">
          {isPlayerInGame ? (
            <GameControls
              onFold={() => console.log('fold')}
              onCheck={() => console.log('check')}
              onCall={() => console.log('call')}
              onRaise={(amount) => console.log('raise', amount)}
              onAllIn={() => console.log('all in')}
              canCheck={true}
              canCall={true}
              callAmount={0.1}
              minRaise={0.2}
              maxRaise={10}
              playerChips={5}
            />
          ) : (
            <div className="bg-black/60 backdrop-blur-sm p-6 text-center">
              <p className="text-gray-300 text-lg">{t('game.status.waiting')}</p>
            </div>
          )}
        </div>

        <div className="absolute top-20 right-4 space-y-2 z-10">
          {players.map((player, index) => (
            <div
              key={player.id}
              className={`bg-black/60 backdrop-blur-sm rounded-lg p-3 border ${
                player.wallet_address === account
                  ? 'border-amber-500'
                  : 'border-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  player.status === 'active' ? 'bg-green-500' : 'bg-gray-500'
                }`}></div>
                <div>
                  <div className="text-white text-sm font-semibold">
                    {player.wallet_address.slice(0, 6)}...{player.wallet_address.slice(-4)}
                  </div>
                  <div className="text-amber-400 text-xs font-mono">
                    {player.chip_count.toFixed(2)} BNB
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
