export default function MobileNav() {
  return (
    <div className="md:hidden glass-panel w-full flex justify-between items-center px-6 py-4 border-b border-white/5 shrink-0">
      <div className="font-headline-md text-headline-md text-primary">NeonChat</div>
      <div className="flex gap-4">
        <span className="material-symbols-outlined text-primary">search</span>
        <span className="material-symbols-outlined text-primary">more_vert</span>
      </div>
    </div>
  );
}
