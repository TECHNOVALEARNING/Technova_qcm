import { motion } from "framer-motion";
import { BrainCircuit, Sparkles, Trophy } from "lucide-react";

export function HeroAnimation() {
  return (
    <div className="relative w-full py-16 flex items-center justify-center overflow-hidden my-6 rounded-3xl" style={{ perspective: "1000px" }}>
      {/* Decorative background glows */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.3, 0.15],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-64 h-64 rounded-full blur-[80px]"
        style={{ backgroundColor: "rgba(130,228,214,0.6)", top: "10%", left: "25%" }}
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.1, 0.25, 0.1],
        }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute w-72 h-72 rounded-full blur-[90px]"
        style={{ backgroundColor: "rgba(255, 107, 74, 0.5)", bottom: "5%", right: "20%" }}
      />

      {/* Floating Cards */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex gap-4 md:gap-8 items-center justify-center transform-gpu"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Card 1 */}
        <motion.div
          animate={{ y: [-8, 8, -8], rotateZ: -6, rotateY: 10 }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="hidden md:flex w-48 h-64 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 flex-col justify-between shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
        >
          <div className="flex items-center gap-2 text-cyan-200/70 text-xs font-bold tracking-widest uppercase">
            <BrainCircuit size={14} /> Culture G
          </div>
          <div className="space-y-3">
            <div className="w-full h-2 bg-white/10 rounded-full" />
            <div className="w-4/5 h-2 bg-white/10 rounded-full" />
            <div className="w-5/6 h-2 bg-white/10 rounded-full" />
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            <div className="h-8 rounded-lg bg-white/5 border border-white/10" />
            <div className="h-8 rounded-lg border" style={{ backgroundColor: "rgba(130,228,214,0.15)", borderColor: "rgba(130,228,214,0.4)" }} />
            <div className="h-8 rounded-lg bg-white/5 border border-white/10" />
            <div className="h-8 rounded-lg bg-white/5 border border-white/10" />
          </div>
        </motion.div>

        {/* Card 2 (Main) */}
        <motion.div
          animate={{ y: [8, -8, 8], scale: [1, 1.02, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="w-64 h-80 rounded-2xl border border-white/20 p-6 flex flex-col justify-between shadow-[0_24px_54px_rgba(255,107,74,0.18)] z-20"
          style={{ background: "linear-gradient(140deg, rgba(255,255,255,0.12), rgba(255,255,255,0.03))", backdropFilter: "blur(24px)" }}
        >
          <div className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase mb-4" style={{ color: "#ff8a72" }}>
            <Sparkles size={14} /> Intelligence
          </div>
          <h3 className="text-white font-display text-xl leading-tight mb-4" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
            Testez vos réflexes neuronaux.
          </h3>
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center text-[11px] text-white/50">A</div>
              <div className="h-2 w-20 bg-white/20 rounded-full" />
            </div>
            <motion.div 
              whileHover={{ scale: 1.03 }}
              className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer" 
              style={{ borderColor: "rgba(255,107,74,0.5)", backgroundColor: "rgba(255,107,74,0.15)" }}>
              <div className="w-6 h-6 rounded-full text-white flex items-center justify-center text-[11px] font-bold shadow-[0_0_10px_rgba(255,107,74,0.8)]" style={{ backgroundColor: "#ff6b4a" }}>B</div>
              <div className="h-2 w-28 rounded-full" style={{ backgroundColor: "rgba(255,107,74,0.7)" }} />
            </motion.div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center text-[11px] text-white/50">C</div>
              <div className="h-2 w-16 bg-white/20 rounded-full" />
            </div>
          </div>
        </motion.div>

        {/* Card 3 */}
        <motion.div
          animate={{ y: [-5, 5, -5], rotateZ: 6, rotateY: -10 }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          className="hidden md:flex w-48 h-64 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 flex-col justify-between shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
        >
          <div className="flex items-center gap-2 text-indigo-300/70 text-xs font-bold tracking-widest uppercase">
            <Trophy size={14} /> Score
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="relative">
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-2 border-dashed border-indigo-400/40" 
              />
              <div className="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-[0_0_30px_rgba(129,140,248,0.2)]" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                +1
              </div>
            </div>
          </div>
          <div className="h-8 rounded-lg border flex items-center justify-center text-xs font-bold" style={{ backgroundColor: "rgba(129,140,248,0.15)", borderColor: "rgba(129,140,248,0.3)", color: "rgb(199,210,254)" }}>
            Excellent !
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
