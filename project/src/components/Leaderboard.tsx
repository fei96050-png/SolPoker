import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Trophy, TrendingUp } from 'lucide-react';
import { getLeaderboard, PlayerStats } from '../lib/supabase';

export function Leaderboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<PlayerStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  async function loadLeaderboard() {
    const data = await getLeaderboard(50);
    setStats(data);
    setLoading(false);
  }

  function getRankColor(rank: number) {
    switch (rank) {
      case 1:
        return 'text-yellow-400';
      case 2:
        return 'text-gray-300';
      case 3:
        return 'text-amber-600';
      default:
        return 'text-gray-400';
    }
  }

  function getRankIcon(rank: number) {
    if (rank <= 3) {
      return <Trophy className={getRankColor(rank)} size={24} />;
    }
    return <span className="text-gray-400 font-bold">{rank}</span>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Trophy className="text-amber-500" size={40} />
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">{t('leaderboard.title')}</h1>
          <p className="text-gray-400">Top players by earnings</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    {t('leaderboard.rank')}
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    {t('leaderboard.player')}
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">
                    {t('leaderboard.games')}
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">
                    {t('leaderboard.wins')}
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">
                    {t('leaderboard.winRate')}
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">
                    {t('leaderboard.earnings')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {stats.map((stat, index) => (
                  <tr key={stat.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center w-10">
                        {getRankIcon(index + 1)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white font-mono">
                        {stat.wallet_address.slice(0, 8)}...{stat.wallet_address.slice(-6)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-300">
                      {stat.games_played}
                    </td>
                    <td className="px-6 py-4 text-center text-green-400 font-semibold">
                      {stat.games_won}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <TrendingUp className="text-blue-400" size={16} />
                        <span className="text-blue-400 font-semibold">
                          {(stat.win_rate * 100).toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-amber-400 font-bold">
                        {stat.total_winnings.toFixed(4)} BNB
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {stats.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              No players yet. Be the first to play!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
