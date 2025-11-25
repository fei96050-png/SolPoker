import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Users, Coins } from 'lucide-react';
import { getActiveRooms, Room } from '../lib/supabase';
import { useWeb3 } from '../contexts/Web3Context';
import { CreateRoomModal } from './CreateRoomModal';
import { formatEther } from 'ethers';

export function Lobby() {
  const { t } = useTranslation();
  const { isConnected } = useWeb3();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadRooms();
    const interval = setInterval(loadRooms, 5000);
    return () => clearInterval(interval);
  }, []);

  async function loadRooms() {
    const activeRooms = await getActiveRooms();
    setRooms(activeRooms);
    setLoading(false);
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'waiting':
        return 'bg-yellow-500';
      case 'playing':
        return 'bg-green-500';
      case 'finished':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  }

  function getStatusText(status: string) {
    return t(`lobby.${status}`);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">{t('lobby.title')}</h1>
          <p className="text-gray-400">{t('lobby.activeRooms')}</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          disabled={!isConnected}
          className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-amber-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          <Plus size={20} />
          {t('lobby.createRoom')}
        </button>
      </div>

      {!isConnected && (
        <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4 mb-6">
          <p className="text-blue-200 text-center">{t('wallet.connectToPlay')}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
        </div>
      ) : rooms.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-gray-400 text-lg mb-4">{t('lobby.noRooms')}</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 hover:border-amber-500/50 transition-all shadow-lg hover:shadow-amber-500/20 cursor-pointer"
              onClick={() => window.location.href = `/room/${room.id}`}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-white">{room.room_name}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(room.status)}`}>
                  {getStatusText(room.status)}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400 flex items-center gap-2">
                    <Users size={16} />
                    {t('lobby.players')}
                  </span>
                  <span className="text-white font-semibold">
                    {room.current_players} / {room.max_players}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400 flex items-center gap-2">
                    <Coins size={16} />
                    {t('lobby.buyIn')}
                  </span>
                  <span className="text-amber-400 font-semibold">
                    {room.buy_in_amount} BNB
                  </span>
                </div>

                <div className="pt-3 border-t border-gray-700">
                  <p className="text-xs text-gray-500">
                    {t('room.info.creator')}: {room.creator_address.slice(0, 6)}...{room.creator_address.slice(-4)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateRoomModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadRooms();
          }}
        />
      )}
    </div>
  );
}
