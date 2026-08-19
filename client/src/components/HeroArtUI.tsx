import { Check, Coins, Gamepad2, Hexagon, Shield, Star, Trophy, User, Wifi, Zap } from "lucide-react";

export function HeroArtUI() {
  return (
    <div className="relative w-full min-h-[520px] flex items-center justify-center lg:justify-end" style={{ perspective: "1800px" }}>
      
      {/* Glowing orange platform beneath everything */}
      <div className="absolute bottom-[0%] left-1/2 -translate-x-[40%] w-[520px] h-[260px] pointer-events-none" style={{ transform: "translateX(-40%) rotateX(75deg)", transformStyle: "preserve-3d" }}>
        <div className="absolute inset-0 rounded-full bg-[#ff6b4a]/15 blur-[60px]" />
        <div className="absolute inset-[15%] rounded-full border border-[#ff6b4a]/30 shadow-[0_0_40px_rgba(255,107,74,0.3)]" />
        <div className="absolute inset-[30%] rounded-full border-2 border-[#ff6b4a]/50 shadow-[0_0_25px_rgba(255,107,74,0.5)]" />
      </div>

      {/* Main floating UI panel with 3D tilt */}
      <div 
        className="relative z-10 w-[520px] xl:w-[580px]"
        style={{ 
          transform: "rotateY(-12deg) rotateX(3deg) translateZ(0px)",
          transformStyle: "preserve-3d"
        }}
      >
        <div className="bg-[#111a2e]/95 backdrop-blur-xl border border-white/[0.06] rounded-2xl shadow-[0_40px_80px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.03)] p-5">
          
          {/* Header: logo + coins + avatar */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="relative flex items-center justify-center text-[#ff6b4a]">
                <Hexagon size={22} fill="currentColor" className="opacity-25" />
                <Hexagon size={22} className="absolute" />
              </div>
              <span className="text-white font-semibold text-[15px] tracking-wide" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>Technova QCM</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-black/50 rounded-full px-3 py-1.5 border border-white/[0.06]">
                <Coins size={13} className="text-yellow-500" fill="currentColor" />
                <span className="text-white text-xs font-bold">1250</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/[0.06] flex items-center justify-center text-white/60">
                <User size={15} />
              </div>
            </div>
          </div>

          {/* XP Progress bar */}
          <div className="flex items-center gap-3 mb-5">
            <span className="text-white/60 text-[11px] font-semibold whitespace-nowrap" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>Niveau 12</span>
            <div className="flex-1 h-[5px] bg-black/40 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#ff6b4a] to-[#ff8a6a] w-[65%] rounded-full shadow-[0_0_12px_rgba(255,107,74,0.6)]" />
            </div>
            <span className="text-white/40 text-[10px] whitespace-nowrap font-medium">650 / 1000 XP</span>
          </div>

          {/* Content: Question + Sidebar */}
          <div className="flex gap-3">
            {/* Question card */}
            <div className="flex-1">
              <div className="bg-[#0d1525]/80 rounded-xl border border-white/[0.04] p-4">
                <div className="text-white/40 text-[11px] mb-2 font-medium">Question 12</div>
                <p className="text-white text-[14px] leading-[1.55] mb-5 font-medium">
                  Quel protocole est utisé pour sécuriser les échanges web ?
                </p>
                <div className="space-y-2">
                  {/* Option A */}
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#0a1120] border border-white/[0.04] text-white/60 transition-colors">
                    <div className="w-[22px] h-[22px] rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-[10px] font-semibold shrink-0">A</div>
                    <span className="text-[13px]">FTP</span>
                  </div>
                  {/* Option B */}
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#0a1120] border border-white/[0.04] text-white/60 transition-colors">
                    <div className="w-[22px] h-[22px] rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-[10px] font-semibold shrink-0">B</div>
                    <span className="text-[13px]">HTTP</span>
                  </div>
                  {/* Option C — selected/correct */}
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gradient-to-r from-[#ff6b4a] to-[#ff7f5e] text-white shadow-[0_0_20px_rgba(255,107,74,0.25)] relative">
                    <div className="w-[22px] h-[22px] rounded-full bg-white/25 flex items-center justify-center text-[10px] font-bold shrink-0">C</div>
                    <span className="text-[13px] font-semibold">HTTPS</span>
                    <div className="absolute right-3 w-[22px] h-[22px] bg-white rounded-full flex items-center justify-center text-[#ff6b4a]">
                      <Check size={12} strokeWidth={3.5} />
                    </div>
                  </div>
                  {/* Option D */}
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#0a1120] border border-white/[0.04] text-white/60 transition-colors">
                    <div className="w-[22px] h-[22px] rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-[10px] font-semibold shrink-0">D</div>
                    <span className="text-[13px]">SMTP</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right sidebar cards */}
            <div className="w-[130px] xl:w-[145px] space-y-2.5 shrink-0">
              {/* Theme card */}
              <div className="bg-[#0d1525]/80 rounded-xl border border-white/[0.04] p-3.5">
                <span className="text-white/35 text-[10px] block mb-0.5 font-medium">Thème</span>
                <strong className="text-white text-[13px] block mb-3 font-semibold" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>Réseaux</strong>
                <div className="flex items-center justify-center">
                  <div className="relative w-14 h-14 flex items-center justify-center text-[#ff6b4a]">
                    <Hexagon size={56} className="absolute" strokeWidth={1.2} />
                    <Hexagon size={56} className="absolute opacity-15" fill="currentColor" />
                    <Wifi size={22} className="relative z-10" />
                  </div>
                </div>
              </div>
              
              {/* Score card */}
              <div className="bg-[#0d1525]/80 rounded-xl border border-white/[0.04] p-3.5">
                <span className="text-white/35 text-[10px] block mb-0.5 font-medium">Score</span>
                <strong className="text-[26px] text-white font-bold leading-none" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>850</strong>
              </div>

              {/* Badges card */}
              <div className="bg-[#0d1525]/80 rounded-xl border border-white/[0.04] p-3.5">
                <span className="text-white/35 text-[10px] block mb-2 font-medium">Badges</span>
                <div className="flex justify-between gap-0.5">
                  <div className="relative w-[30px] h-[30px] flex items-center justify-center text-[#ff6b4a]">
                    <Hexagon size={30} className="absolute" strokeWidth={1.3} />
                    <Hexagon size={30} className="absolute opacity-15" fill="currentColor" />
                    <Star size={11} fill="currentColor" className="relative z-10" />
                  </div>
                  <div className="relative w-[30px] h-[30px] flex items-center justify-center text-[#ff6b4a]">
                    <Hexagon size={30} className="absolute" strokeWidth={1.3} />
                    <Hexagon size={30} className="absolute opacity-15" fill="currentColor" />
                    <Shield size={11} className="relative z-10" />
                  </div>
                  <div className="relative w-[30px] h-[30px] flex items-center justify-center text-[#ff6b4a]">
                    <Hexagon size={30} className="absolute" strokeWidth={1.3} />
                    <Hexagon size={30} className="absolute opacity-15" fill="currentColor" />
                    <Zap size={11} fill="currentColor" className="relative z-10" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trophy — bottom left of the composition */}
      <div className="absolute bottom-[2%] left-[30%] z-20 pointer-events-none" style={{ transform: "translateZ(30px)" }}>
        <div className="relative">
          <Trophy size={72} strokeWidth={1} className="text-[#1a2d4a] drop-shadow-[0_8px_16px_rgba(0,0,0,0.7)]" />
          <Star size={20} className="absolute text-[#ff6b4a] top-[25%] left-1/2 -translate-x-1/2" fill="currentColor" />
        </div>
      </div>

      {/* Gamepad — bottom center of the composition */}
      <div className="absolute bottom-[0%] left-[45%] z-20 pointer-events-none" style={{ transform: "rotate(-8deg) translateZ(40px)" }}>
        <Gamepad2 size={100} strokeWidth={0.8} className="text-[#1a2d4a] drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)]" />
      </div>
    </div>
  );
}
