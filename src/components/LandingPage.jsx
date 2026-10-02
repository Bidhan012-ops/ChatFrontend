import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="bg-[#0f131c] text-[#e2e7f3] min-h-screen flex flex-col font-sans selection:bg-[#00f5a0] selection:text-[#003b24]">
      {/* Minimal Sleek Navigation Header */}
      <header className="sticky top-0 z-50 w-full pt-[env(safe-area-inset-top,0px)] bg-[#0f131c]/80 backdrop-blur-md border-b border-[#1e2430]">
        <div className="max-w-4xl mx-auto px-5 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link className="flex items-center gap-2.5 group" to="/">
            <img 
              alt="NeonChat" 
              className="w-8 h-8 rounded-lg shadow-[0_0_12px_rgba(0,245,160,0.25)] transition-transform group-hover:scale-105 object-cover" 
              src="/logo.jpg" 
            />
            <span className="font-bold text-base tracking-tight text-white font-sans">NeonChat</span>
          </Link>
          {/* Header Action */}
          <div className="flex items-center gap-3">
            <Link className="text-xs font-semibold text-[#929cb2] hover:text-white transition-colors px-2.5 py-1.5" to="/signin">Sign In</Link>
            <Link className="text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white border border-white/10 transition-all active:scale-[0.98]" to="/signup">
              Launch App
            </Link>
          </div>
        </div>
      </header>
      
      {/* Main Scrollable Content Area */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-5 flex flex-col gap-20 py-12 md:py-20">
        {/* 1. Hero Section */}
        <section className="flex flex-col items-center text-center max-w-2xl mx-auto pt-4 sm:pt-8">
          {/* Minimal Live Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141822] border border-[#2a3140]/60 text-xs font-medium text-[#929cb2] mb-6 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00f5a0] shadow-[0_0_8px_#00f5a0]"></span>
            <span>Version 2.0 now live & open source</span>
          </div>
          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-[1.15]">
            Encrypted messaging,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f5a0] via-[#4edea3] to-sky-300">
              distilled to perfection.
            </span>
          </h1>
          {/* Subtitle */}
          <p className="mt-4 sm:mt-5 text-sm sm:text-base text-[#929cb2] leading-relaxed max-w-lg">
            Lightning-fast P2P communication built on zero-knowledge encryption. Zero tracking, peerless fidelity, crafted with absolute focus.
          </p>
          {/* Primary Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <Link className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#00f5a0] hover:bg-emerald-300 text-[#003b24] font-semibold text-sm flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(0,245,160,0.28)] transition-all active:scale-[0.98]" to="/signup">
              <span>Get Started Free</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
            <Link className="w-full sm:w-auto px-5 py-3 rounded-xl text-[#929cb2] hover:text-white font-medium text-sm flex items-center justify-center gap-1.5 transition-colors" to="/signin">
              <span>Read the Whitepaper</span>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </Link>
          </div>
        </section>
        
        {/* 2. Clean Minimal Metrics Strip */}
        <div className="w-full rounded-2xl border border-white/10 bg-[#141822]/60 p-2 sm:p-3 shadow-[0_0_24px_rgba(0,245,160,0.15)] overflow-hidden">
          <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDJ-NdB7HTgSOK1MpaZnw5_eEjKa9a7giVQMjRn6LQHyTNO29fyZf9WC3cOutV7YvGpzMMaZ-IE7Vn6-m4VWwdkYiwOWq2ZZtPVfIyJK0y_3MzSiHSLO3l-yjbCbUvPTLEefLa-oHOVXmIIif93xldIxYIL9t2JmBHD-dgHru6uL84dLCka70ID2ZJbSiarr9lN5zTfXQg-z2W5sjjcX6hr_RTHKGmoHSiBXwabjKWMpgMMbEnqJCo3sA" alt="NeonChat Network Banner" className="w-full rounded-xl object-cover shadow-sm transition-transform duration-300 hover:scale-[1.01]" />
        </div>
        
        {/* 3. Minimal Essential Features Grid */}
        <section className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Engineered for Sovereignty</h2>
            <p className="text-sm text-[#929cb2] max-w-md">Every protocol layer is tuned strictly for user autonomy and uncompromised privacy.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1 */}
            <div className="p-6 rounded-2xl bg-[#141822]/70 border border-[#2a3140]/70 flex flex-col gap-4 hover:border-[#2a3140] transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#1a1e28] flex items-center justify-center text-[#00f5a0] border border-[#1e2430]">
                <span className="material-symbols-outlined text-[20px]">bolt</span>
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">Instantaneous Delivery</h3>
                <p className="text-xs sm:text-sm text-[#929cb2] mt-1.5 leading-relaxed">
                  Global low-hop mesh connections guarantee sub-10ms transport without central bottlenecks.
                </p>
              </div>
            </div>
            {/* Card 2 */}
            <div className="p-6 rounded-2xl bg-[#141822]/70 border border-[#2a3140]/70 flex flex-col gap-4 hover:border-[#2a3140] transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#1a1e28] flex items-center justify-center text-[#00f5a0] border border-[#1e2430]">
                <span className="material-symbols-outlined text-[20px]">lock</span>
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">Zero-Knowledge Sync</h3>
                <p className="text-xs sm:text-sm text-[#929cb2] mt-1.5 leading-relaxed">
                  Keys remain exclusively on your device. Messages are undecryptable by servers or ISPs.
                </p>
              </div>
            </div>
            {/* Card 3 */}
            <div className="p-6 rounded-2xl bg-[#141822]/70 border border-[#2a3140]/70 flex flex-col gap-4 hover:border-[#2a3140] transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#1a1e28] flex items-center justify-center text-[#00f5a0] border border-[#1e2430]">
                <span className="material-symbols-outlined text-[20px]">mic</span>
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">P2P Voice & Video</h3>
                <p className="text-xs sm:text-sm text-[#929cb2] mt-1.5 leading-relaxed">
                  Native WebRTC direct peer streams with real-time neural background isolation.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* 4. Minimalist Trust / Testimonial Quote */}
        <section className="w-full">
          <div className="p-7 sm:p-8 rounded-2xl bg-[#141822]/40 border border-[#2a3140]/60 flex flex-col gap-5">
            <p className="text-sm sm:text-base text-[#e2e7f3] leading-relaxed italic">
              "NeonChat delivers the refined experience developers crave: zero bloat, flawless dark UI, and cryptographic guarantees that actually hold under scrutiny."
            </p>
            <div className="flex items-center gap-3 pt-2 border-t border-[#1e2430]">
              <div className="w-8 h-8 rounded-full bg-[#222734] border border-[#2a3140] flex items-center justify-center font-bold text-xs text-[#00f5a0]">
                DA
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Deba Acharya</p>
                <p className="text-[11px] text-[#929cb2]">Security Architect & Core Contributor</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      {/* Clean Minimal Footer */}
      <footer className="w-full border-t border-[#1e2430] py-8 pb-[env(safe-area-inset-bottom,0px)] mt-auto">
        <div className="max-w-4xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#929cb2]">
          <div className="flex items-center gap-2">
            <img 
              alt="NeonChat" 
              className="w-4 h-4 rounded-sm opacity-80 object-cover" 
              src="/logo.jpg" 
            />
            <span>© 2025 NeonChat Protocol. Distilled & open source.</span>
          </div>
          <div className="flex items-center gap-5">
            <Link className="hover:text-white transition-colors" to="/">Privacy</Link>
            <Link className="hover:text-white transition-colors" to="/">Security</Link>
            <Link className="hover:text-white transition-colors" to="/">GitHub</Link>
            <Link className="hover:text-white transition-colors" to="/">Status</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
