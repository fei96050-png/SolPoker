import { useTranslation } from 'react-i18next';
import { ExternalLink } from 'lucide-react';

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-t border-gray-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-4">{t('app.title')}</h3>
            <p className="text-gray-400 text-sm">{t('app.subtitle')}</p>
            <div className="mt-4">
              <p className="text-gray-400 text-sm">{t('footer.platform')}</p>
            </div>
          </div>

          <div>
            <h3 className="text-white font-bold text-lg mb-4">{t('footer.smartContract')}</h3>
            <a
              href={`https://testnet.bscscan.com/address/${import.meta.env.VITE_CONTRACT_ADDRESS || ''}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors text-sm"
            >
              {t('footer.verify')}
              <ExternalLink size={14} />
            </a>
          </div>

          <div>
            <h3 className="text-white font-bold text-lg mb-4">{t('footer.followUs')}</h3>
            <div className="flex gap-4">
              <a
                href="https://twitter.com/bscpoker"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span>Twitter/X</span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-700 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 BSC Poker. All rights reserved. Play responsibly.
          </p>
        </div>
      </div>
    </footer>
  );
}
