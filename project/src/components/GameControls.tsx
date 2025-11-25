import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Minus, Plus } from 'lucide-react';

interface GameControlsProps {
  onFold: () => void;
  onCheck: () => void;
  onCall: () => void;
  onRaise: (amount: number) => void;
  onAllIn: () => void;
  canCheck: boolean;
  canCall: boolean;
  callAmount: number;
  minRaise: number;
  maxRaise: number;
  playerChips: number;
}

export function GameControls({
  onFold,
  onCheck,
  onCall,
  onRaise,
  onAllIn,
  canCheck,
  canCall,
  callAmount,
  minRaise,
  maxRaise,
  playerChips
}: GameControlsProps) {
  const { t } = useTranslation();
  const [raiseAmount, setRaiseAmount] = useState(minRaise);
  const [showRaiseSlider, setShowRaiseSlider] = useState(false);

  function handleRaiseChange(value: number) {
    setRaiseAmount(Math.max(minRaise, Math.min(maxRaise, value)));
  }

  return (
    <div className="bg-gradient-to-t from-black/90 to-black/60 backdrop-blur-sm border-t border-gray-700 p-6">
      <div className="max-w-4xl mx-auto">
        {showRaiseSlider && (
          <div className="mb-6 bg-gray-800/80 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-300 text-sm">{t('game.betAmount')}</span>
              <span className="text-amber-400 font-bold text-xl">{raiseAmount.toFixed(2)} BNB</span>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => handleRaiseChange(raiseAmount - 0.1)}
                className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors"
              >
                <Minus size={20} />
              </button>

              <input
                type="range"
                min={minRaise}
                max={maxRaise}
                step="0.1"
                value={raiseAmount}
                onChange={(e) => handleRaiseChange(parseFloat(e.target.value))}
                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />

              <button
                onClick={() => handleRaiseChange(raiseAmount + 0.1)}
                className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>

            <div className="flex justify-between mt-2 text-xs text-gray-400">
              <span>{t('game.betAmount')}: {minRaise.toFixed(2)}</span>
              <span>{t('game.chipCount')}: {playerChips.toFixed(2)}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <button
            onClick={onFold}
            className="bg-red-600 hover:bg-red-700 text-white py-4 rounded-lg font-bold text-lg transition-all shadow-lg hover:shadow-red-500/50"
          >
            {t('game.actions.fold')}
          </button>

          {canCheck && (
            <button
              onClick={onCheck}
              className="bg-gray-600 hover:bg-gray-700 text-white py-4 rounded-lg font-bold text-lg transition-all shadow-lg"
            >
              {t('game.actions.check')}
            </button>
          )}

          {canCall && (
            <button
              onClick={onCall}
              className="bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg font-bold text-lg transition-all shadow-lg hover:shadow-blue-500/50"
            >
              {t('game.actions.call')} {callAmount.toFixed(2)}
            </button>
          )}

          <button
            onClick={() => {
              if (showRaiseSlider) {
                onRaise(raiseAmount);
                setShowRaiseSlider(false);
              } else {
                setShowRaiseSlider(true);
              }
            }}
            className="bg-amber-600 hover:bg-amber-700 text-white py-4 rounded-lg font-bold text-lg transition-all shadow-lg hover:shadow-amber-500/50"
          >
            {showRaiseSlider ? `${t('game.actions.raise')} ${raiseAmount.toFixed(2)}` : t('game.actions.raise')}
          </button>

          <button
            onClick={onAllIn}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 rounded-lg font-bold text-lg transition-all shadow-lg hover:shadow-purple-500/50 col-span-2 md:col-span-1"
          >
            {t('game.actions.allIn')}
          </button>
        </div>
      </div>
    </div>
  );
}
