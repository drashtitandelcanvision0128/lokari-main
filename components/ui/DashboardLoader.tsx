export default function DashboardLoader() {
  return (
    <div className="flex h-full min-h-[60vh] w-full flex-col items-center justify-center gap-5">
      {/* Spinner ring */}
      <div className="relative h-12 w-12">
        <span className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent border-t-[#2eb5c2] border-r-[#0b5d68]/30" />
        <div className="absolute inset-[6px] flex items-center justify-center rounded-lg bg-gradient-to-br from-[#0b5d68] to-[#2eb5c2] shadow">
          <img src="/AgriwareLogo.svg" alt="" className="h-4 w-4 brightness-[10]" />
        </div>
      </div>

      {/* Pulsing dots */}
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-[#2eb5c2]"
            style={{ animation: `dlPulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
          />
        ))}
      </div>

      <style>{`
        @keyframes dlPulse {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50%       { opacity: 1;   transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}
