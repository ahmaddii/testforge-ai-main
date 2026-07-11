export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:gap-0 ${className}`}>
      <img src="/integrations/logos/speclane-white.png" alt="Speclane" className="h-10 w-10 object-contain shrink-0 transition-all block" />
      <span className="text-xl font-extrabold italic tracking-tight transition-all duration-200 group-data-[state=collapsed]:opacity-0 group-data-[state=collapsed]:hidden font-sans text-white">
        <span className="font-extrabold text-white">Spec</span><span className="text-primary font-black drop-shadow-[0_0_12px_rgba(237,236,237,0.4)]">lane</span>
      </span>
    </div>
  );
}
