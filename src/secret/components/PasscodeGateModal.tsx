import React, { useState } from 'react';
import { SecretPlayerConfig } from '../types';
import { Lock, KeyRound, X, Delete, ShieldAlert } from 'lucide-react';

interface PasscodeGateModalProps {
  isOpen: boolean;
  botConfig: SecretPlayerConfig;
  onClose: () => void;
  onSuccess: () => void;
}

export const PasscodeGateModal: React.FC<PasscodeGateModalProps> = ({
  isOpen,
  botConfig,
  onClose,
  onSuccess,
}) => {
  const [pin, setPin] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleKeyPress = (num: string) => {
    if (pin.length < 6) {
      const nextPin = pin + num;
      setPin(nextPin);
      setErrorMessage(null);

      // Auto-validate when 6 digits reached
      if (nextPin.length === 6) {
        verifyPin(nextPin);
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorMessage(null);
  };

  const verifyPin = (inputPin: string) => {
    if (inputPin === botConfig.passcode) {
      setErrorMessage(null);
      onSuccess();
    } else {
      setIsShaking(true);
      setErrorMessage('Incorrect PIN Code! Access Denied.');
      setTimeout(() => {
        setIsShaking(false);
        setPin('');
      }, 500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`w-full max-w-xs sm:max-w-sm bg-[#0a0a0c] border-3 sm:border-4 border-slate-200 text-white shadow-[6px_6px_0px_#ffffff] sm:shadow-[8px_8px_0px_#ffffff] p-4 sm:p-6 relative flex flex-col items-center gap-4 sm:gap-5 ${
          isShaking ? 'animate-shake border-red-500 shadow-[6px_6px_0px_#ef4444]' : ''
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 p-1 sm:p-1.5 bg-neutral-800 hover:bg-neutral-700 text-white border-2 border-white cursor-pointer"
          title="Close PIN Gate"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center text-center gap-1.5 sm:gap-2">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-400 border-2 border-black flex items-center justify-center text-black font-black shadow-[2px_2px_0px_#fff] sm:shadow-[3px_3px_0px_#fff]">
            <Lock className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-amber-400">
              Secured Passcode Gate
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-300 font-bold mt-0.5">
              Enter 6-Digit PIN for {botConfig.publicName}
            </p>
          </div>
        </div>

        {/* 6 Dots Indicator */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 py-1 sm:py-2">
          {Array.from({ length: 6 }).map((_, idx) => {
            const isFilled = idx < pin.length;
            return (
              <div
                key={idx}
                className={`w-8 h-10 sm:w-9 sm:h-11 border-2 flex items-center justify-center text-base sm:text-lg font-mono font-black transition-all ${
                  isFilled
                    ? 'border-amber-400 bg-amber-400/20 text-amber-300 shadow-[2px_2px_0px_#fbbf24]'
                    : 'border-slate-700 bg-neutral-900 text-slate-600'
                }`}
              >
                {isFilled ? '●' : ''}
              </div>
            );
          })}
        </div>

        {/* Error Notice */}
        {errorMessage ? (
          <div className="w-full py-1.5 px-3 bg-red-950/80 border-2 border-red-500 text-red-300 text-xs font-bold text-center flex items-center justify-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        ) : (
          <div className="text-[11px] font-mono text-slate-400 text-center">
            Enter the secret 6-digit passcode to challenge
          </div>
        )}

        {/* 3x4 Touch Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2 sm:gap-2.5 w-full">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(num)}
              className="py-2.5 sm:py-3 bg-neutral-900 hover:bg-amber-400 hover:text-black border-2 border-slate-200 text-white font-mono text-base sm:text-lg font-black shadow-[2px_2px_0px_#fff] sm:shadow-[3px_3px_0px_#fff] active:translate-x-0.5 active:translate-y-0.5 transition-colors cursor-pointer"
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleDelete}
            className="py-2.5 sm:py-3 bg-neutral-800 hover:bg-red-500 text-white border-2 border-slate-200 font-black text-xs uppercase flex items-center justify-center shadow-[2px_2px_0px_#fff] sm:shadow-[3px_3px_0px_#fff] cursor-pointer"
            title="Delete Digit"
          >
            <Delete className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={() => handleKeyPress('0')}
            className="py-2.5 sm:py-3 bg-neutral-900 hover:bg-amber-400 hover:text-black border-2 border-slate-200 text-white font-mono text-base sm:text-lg font-black shadow-[2px_2px_0px_#fff] sm:shadow-[3px_3px_0px_#fff] cursor-pointer"
          >
            0
          </button>
          <button
            onClick={() => verifyPin(pin)}
            disabled={pin.length !== 6}
            className={`py-2.5 sm:py-3 font-black text-xs uppercase border-2 border-slate-200 flex items-center justify-center gap-1 shadow-[2px_2px_0px_#fff] sm:shadow-[3px_3px_0px_#fff] cursor-pointer ${
              pin.length === 6
                ? 'bg-amber-400 text-black hover:bg-amber-300'
                : 'bg-neutral-900 text-slate-600 opacity-60 cursor-not-allowed'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Enter
          </button>
        </div>
      </div>
    </div>
  );
};
