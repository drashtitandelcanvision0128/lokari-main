export default function Loading() {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#ece8e1] dark:bg-gray-900">
      <div className="flex flex-col items-center gap-4">
        {/* Animated logo badge */}
        <div className="relative flex h-16 w-16 items-center justify-center">
          {/* Spinning ring */}
          <span className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-[#2eb5c2] border-r-[#0b5d68]/40" />
          {/* Inner gradient circle */}
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0b5d68] to-[#2eb5c2] shadow-lg">
            <img src="/AgriwareLogo.svg" alt="" className="h-6 w-6 brightness-[10]" />
          </div>
        </div>

        {/* Brand name */}
        <p className="font-headline text-sm font-semibold tracking-widest text-[#0b5d68] dark:text-[#2eb5c2]">
          LOKHARI
        </p>

        {/* Pulsing dots */}
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-[#2eb5c2]"
              style={{ animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50%       { opacity: 1;   transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}
