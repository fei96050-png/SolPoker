interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 48, className = '' }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="chipGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="50%" stopColor="#FFA500" />
          <stop offset="100%" stopColor="#FF6B00" />
        </linearGradient>
        <linearGradient id="chainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4ECDC4" />
          <stop offset="100%" stopColor="#44A08D" />
        </linearGradient>
      </defs>

      <circle cx="100" cy="100" r="95" fill="url(#chipGradient)" />

      <circle cx="100" cy="100" r="85" fill="#1A1A2E" />

      <circle cx="100" cy="100" r="75" fill="none" stroke="url(#chipGradient)" strokeWidth="3" strokeDasharray="8 8" />

      <g transform="translate(100, 100)">
        <path d="M -30,-15 L -15,-15 L -15,-30 L 15,-30 L 15,-15 L 30,-15 L 30,15 L 15,15 L 15,30 L -15,30 L -15,15 L -30,15 Z"
              fill="#E74C3C"
              stroke="#C0392B"
              strokeWidth="2" />

        <path d="M -25,-10 L -10,-10 L -10,-25 L 10,-25 L 10,-10 L 25,-10 L 25,10 L 10,10 L 10,25 L -10,25 L -10,10 L -25,10 Z"
              fill="#E74C3C" />
      </g>

      <text x="100" y="115" textAnchor="middle" fill="white" fontSize="24" fontWeight="bold" fontFamily="Arial, sans-serif">
        A
      </text>

      <path d="M 40,60 L 50,50 L 60,60 M 140,60 L 150,50 L 160,60 M 40,140 L 50,150 L 60,140 M 140,140 L 150,150 L 160,140"
            stroke="url(#chainGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none" />

      <circle cx="50" cy="50" r="4" fill="url(#chainGradient)" />
      <circle cx="150" cy="50" r="4" fill="url(#chainGradient)" />
      <circle cx="50" cy="150" r="4" fill="url(#chainGradient)" />
      <circle cx="150" cy="150" r="4" fill="url(#chainGradient)" />
    </svg>
  );
}

export function LogoText({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Logo size={40} />
      <div className="flex flex-col">
        <span className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
          BSC Poker
        </span>
        <span className="text-xs text-gray-400">Blockchain Texas Hold'em</span>
      </div>
    </div>
  );
}
