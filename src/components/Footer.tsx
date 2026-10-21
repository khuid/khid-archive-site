type Props = {
  /** 아카이브에 있는 가장 오래된 / 최근 전시 연도. 둘이 다르면 "2023–2026"처럼 범위로 표시 */
  firstYear?: number;
  latestYear?: number;
};

/**
 * 페이지 맨 아래 저작권 표시. 운영 주체(학과) + 작품 저작권은 각 작가에게 있음을 밝힘.
 * 연도는 public/exhibitions 폴더에서 자동으로 계산(직접 입력 안 함).
 * 좌우 여백은 Phase 2·3과 동일(모바일 24 / 데스크탑 93).
 */
export default function Footer({ firstYear, latestYear }: Props) {
  const years =
    firstYear && latestYear && firstYear !== latestYear
      ? `${firstYear}–${latestYear}`
      : (latestYear ?? firstYear);

  return (
    <footer className="px-6 pb-10 min-[1280px]:px-[93px] min-[1280px]:pb-14">
      <div className="flex flex-col gap-1 border-t border-foreground/15 pt-6 font-sans text-[12px] leading-[1.5] tracking-[-0.04em] text-muted min-[1280px]:text-[14px]">
        <p>
          ©{years ? ` ${years}` : ""} Department of Industrial Design, Kyung Hee University. All rights
          reserved.
        </p>
        <p>All works are the property of their respective creators and may not be reproduced without permission.</p>
      </div>
    </footer>
  );
}
