export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center px-6 py-2 md:px-[50px] backdrop-blur-[4px] bg-[rgba(20,20,20,0.8)] shadow-[0px_2px_40px_0px_rgba(0,0,0,0.02)]">
      <div className="flex w-full max-w-[1920px] items-center gap-6">
        <div className="flex items-center gap-3">
          {/* TODO: 실제 경희 휘장 로고 SVG로 교체 (work/assets/logo) */}
          <div
            aria-hidden
            className="size-[40px] shrink-0 rounded-full border border-foreground/40"
          />
          <span className="font-display text-sm tracking-tight text-foreground">KHID</span>
        </div>
        <div className="font-sans text-[14px] leading-[1.2] tracking-[-0.56px] text-foreground">
          <p>KyungHee Industrial Design</p>
          <p>Graduation On-line Exhibition Archive</p>
        </div>
      </div>
    </header>
  );
}
