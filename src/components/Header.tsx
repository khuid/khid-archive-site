// 모바일~태블릿(~1023)은 Figma 모바일 헤더(390) 실측: 데스크탑의 0.786배(휘장 40→31.43),
// 좌우 여백 16, 높이 44. 설명 텍스트는 숨기고 1024부터 데스크탑 크기 + 텍스트 표시
export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center px-4 py-[6.29px] min-[1024px]:px-[50px] min-[1024px]:py-2 backdrop-blur-[4px] bg-[rgba(18,18,18,0.8)] shadow-[0px_2px_40px_0px_rgba(0,0,0,0.02)]">
      <div className="flex w-full max-w-[1920px] items-center gap-6">
        <div className="flex items-center gap-[9.43px] min-[1024px]:gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo/khu1.svg"
            alt="경희대학교 휘장"
            className="size-[31.43px] shrink-0 object-contain min-[1024px]:size-[40px]"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo/kiiid.svg" alt="KHID" className="h-[14.23px] w-auto min-[1024px]:h-[18px]" />
        </div>
        <div className="hidden font-sans text-[14px] leading-[1.2] tracking-[-0.56px] text-foreground min-[1024px]:block">
          <p>KyungHee Industrial Design</p>
          <p>Graduation On-line Exhibition Archive</p>
        </div>
      </div>
    </header>
  );
}
