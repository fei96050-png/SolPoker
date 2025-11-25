import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Wallet, Globe, ExternalLink } from 'lucide-react';
import { useWeb3 } from '../contexts/Web3Context';
import { LogoText } from './Logo';

export function Header() {
  const { t, i18n } = useTranslation();
  const { account, balance, isConnected, isCorrectNetwork, connectWallet, disconnectWallet, switchNetwork } = useWeb3();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  function changeLanguage(lang: 'en' | 'zh') {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
    setShowLanguageMenu(false);
  }

  function formatAddress(address: string) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  return (
    <header className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <LogoText />

          <nav className="hidden md:flex items-center gap-6">
            <a href="/" className="text-gray-300 hover:text-white transition-colors font-medium">
              {t('nav.lobby')}
            </a>
            <a href="/leaderboard" className="text-gray-300 hover:text-white transition-colors font-medium">
              {t('nav.leaderboard')}
            </a>
            <a href="/profile" className="text-gray-300 hover:text-white transition-colors font-medium">
              {t('nav.profile')}
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <Globe size={18} />
                <span className="uppercase">{i18n.language}</span>
              </button>

              {showLanguageMenu && (
                <div className="absolute right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden z-50">
                  <button
                    onClick={() => changeLanguage('en')}
                    className="block w-full px-4 py-2 text-left text-white hover:bg-gray-700 transition-colors"
                  >
                    English
                  </button>
                  <button
                    onClick={() => changeLanguage('zh')}
                    className="block w-full px-4 py-2 text-left text-white hover:bg-gray-700 transition-colors"
                  >
                    中文
                  </button>
                </div>
              )}
            </div>

            <a
              href="https://twitter.com/bscpoker"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>

            {!isConnected ? (
              <button
                onClick={connectWallet}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-amber-600 hover:to-orange-700 transition-all shadow-lg"
              >
                <Wallet size={18} />
                {t('wallet.connect')}
              </button>
            ) : !isCorrectNetwork ? (
              <button
                onClick={switchNetwork}
                className="flex items-center gap-2 bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                {t('wallet.switchToBSC')}
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <div className="bg-gray-700 px-4 py-2 rounded-lg">
                  <div className="text-xs text-gray-400">{t('wallet.balance')}</div>
                  <div className="text-white font-semibold">{parseFloat(balance).toFixed(4)} BNB</div>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                  title={account || ''}
                >
                  <Wallet size={18} />
                  <span className="font-mono">{formatAddress(account!)}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
