import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Trophy, TrendingUp, DollarSign } from 'lucide-react';
import { useWeb3 } from '../contexts/Web3Context';
import { supabase, PlayerStats } from '../lib/supabase';

export function Profile() {
  const { t } = useTranslation();
  const { account, isConnected } = useWeb3();
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (account) {
      loadPlayerStats();
    }
  }, [account]);

  async function loadPlayerStats() {
    if (!account) return;

    const { data, error } = await supabase
      .from('player_stats')
      .select('*')
      .eq('wallet_address', account)
      .maybeSingle();

    if (data) {
      setStats(data);
    }
    setLoading(false);
  }

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <User className="mx-auto text-gray-400 mb-4" size={64} />
        <h2 className="text-2xl font-bold text-white mb-2">{t('wallet.connectToPlay')}</h2>
        <p className="text-gray-400">Connect your wallet to view your profile</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-8 border border-gray-700 mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-full p-4">
            <User className="text-white" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">{t('profile.title')}</h1>
            <p className="text-gray-400 font-mono text-sm">
              {account?.slice(0, 10)}...{account?.slice(-8)}
            </p>
          </div>
        </div>

        {stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center gap-3 mb-2">
                <Trophy className="text-amber-400" size={24} />
                <span className="text-gray-400 text-sm">{t('profile.totalGames')}</span>
              </div>
              <p className="text-3xl font-bold text-white">{stats.games_played}</p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center gap-3 mb-2">
                <Trophy className="text-green-400" size={24} />
                <span className="text-gray-400 text-sm">{t('profile.totalWins')}</span>
              </div>
              <p className="text-3xl font-bold text-green-400">{stats.games_won}</p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="text-blue-400" size={24} />
                <span className="text-gray-400 text-sm">{t('profile.winRate')}</span>
              </div>
              <p className="text-3xl font-bold text-blue-400">
                {(stats.win_rate * 100).toFixed(1)}%
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="text-amber-400" size={24} />
                <span className="text-gray-400 text-sm">{t('profile.totalEarnings')}</span>
              </div>
              <p className="text-2xl font-bold text-amber-400">
                {stats.total_winnings.toFixed(4)} BNB
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400">No statistics available. Play some games to see your stats!</p>
          </div>
        )}
      </div>

      {stats && stats.biggest_pot > 0 && (
        <div className="bg-gradient-to-br from-amber-900/30 to-orange-900/30 rounded-xl p-6 border border-amber-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-400 text-sm font-semibold mb-1">{t('profile.biggestPot')}</p>
              <p className="text-4xl font-bold text-white">{stats.biggest_pot.toFixed(4)} BNB</p>
            </div>
            <Trophy className="text-amber-400" size={48} />
          </div>
        </div>
      )}
    </div>
  );
}
