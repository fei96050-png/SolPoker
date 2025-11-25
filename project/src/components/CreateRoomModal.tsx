import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { useWeb3 } from '../contexts/Web3Context';
import { createRoom } from '../lib/supabase';
import { parseEther } from 'ethers';

interface CreateRoomModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateRoomModal({ onClose, onSuccess }: CreateRoomModalProps) {
  const { t } = useTranslation();
  const { account, contract } = useWeb3();
  const [roomName, setRoomName] = useState('');
  const [buyInAmount, setBuyInAmount] = useState('0.01');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleCreateRoom() {
    if (!account || !contract) {
      setError(t('errors.walletNotConnected'));
      return;
    }

    if (!roomName.trim()) {
      setError('Please enter a room name');
      return;
    }

    const buyIn = parseFloat(buyInAmount);
    if (isNaN(buyIn) || buyIn < 0.01) {
      setError(t('errors.invalidAmount'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const buyInWei = parseEther(buyInAmount);
      const tx = await contract.createRoom(buyInWei, { value: buyInWei });
      await tx.wait();

      const room = await createRoom({
        room_name: roomName,
        creator_address: account,
        buy_in_amount: buyIn
      });

      if (room) {
        onSuccess();
      } else {
        setError('Failed to create room in database');
      }
    } catch (err: any) {
      console.error('Error creating room:', err);
      setError(err.message || t('errors.transactionFailed'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl max-w-md w-full p-6 border border-gray-700 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">{t('room.create.title')}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('room.create.roomName')}
            </label>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder={t('room.create.placeholder')}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 transition-colors"
              maxLength={50}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('room.create.buyInAmount')}
            </label>
            <input
              type="number"
              value={buyInAmount}
              onChange={(e) => setBuyInAmount(e.target.value)}
              min="0.01"
              step="0.01"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 transition-colors"
            />
            <p className="text-xs text-gray-400 mt-1">{t('room.create.minAmount')}</p>
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              {t('room.create.cancel')}
            </button>
            <button
              onClick={handleCreateRoom}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-amber-600 hover:to-orange-700 transition-all disabled:opacity-50 shadow-lg"
            >
              {loading ? t('common.loading') : t('room.create.create')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
