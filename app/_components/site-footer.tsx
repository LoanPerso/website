export function SiteFooter() {
  return (
    <footer className="relative bg-deep-black text-white pt-24 pb-12 overflow-hidden" style={{ zIndex: 1 }}>
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start mb-24 gap-12">
          <div className="space-y-8 max-w-xl">
            <h2 className="text-5xl md:text-8xl font-serif leading-[0.8]">
              Let's talk <br />
              <span className="text-gold italic">finance.</span>
            </h2>
            <p className="text-neutral-400 text-lg">
              Une question ? Un projet ? Nos experts sont à votre disposition.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-16 text-sm uppercase tracking-widest text-neutral-400">
            <div className="space-y-4">
              <h3 className="text-white">Socials</h3>
              <ul className="space-y-2">
                <li className="hover:text-gold cursor-pointer transition-colors">LinkedIn</li>
                <li className="hover:text-gold cursor-pointer transition-colors">Instagram</li>
                <li className="hover:text-gold cursor-pointer transition-colors">Twitter</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-white">Legal</h3>
              <ul className="space-y-2">
                <li className="hover:text-gold cursor-pointer transition-colors">Mentions légales</li>
                <li className="hover:text-gold cursor-pointer transition-colors">Politique de confidentialité</li>
                <li className="hover:text-gold cursor-pointer transition-colors">CGU</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-neutral-500 uppercase tracking-wider">
          <div>© 2025 Website. All rights reserved.</div>
          <div className="mt-4 md:mt-0">Paris — London — Geneva</div>
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-gold/5 to-transparent pointer-events-none" />
    </footer>
  );
}