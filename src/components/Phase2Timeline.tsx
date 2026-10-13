"use client";

import { useState } from "react";
import type { Exhibition } from "@/lib/exhibitions";

type Props = {
  exhibitions: Exhibition[];
};

// Figma 실측(desktop 1440): 연도 36px/Light/-1.08px, 타이틀 64px/ExtraBold/-1.92px,
// 연도-타이틀 간격 44px, 행간격 80px. 모바일(390)은 정확히 0.5배, 1920은 1.1배
// (다른 요소들과 동일한 스케일 패턴). 768(태블릿)은 Figma 지정 없어 중간값으로 보간.
const YEAR_TEXT =
  "text-[18px] tracking-[-0.54px] min-[768px]:text-[27px] min-[768px]:tracking-[-0.81px] min-[1440px]:text-[36px] min-[1440px]:tracking-[-1.08px] min-[1920px]:text-[40px] min-[1920px]:tracking-[-1.19px]";
const TITLE_TEXT =
  "text-[32px] tracking-[-0.96px] min-[768px]:text-[48px] min-[768px]:tracking-[-1.44px] min-[1440px]:text-[64px] min-[1440px]:tracking-[-1.92px] min-[1920px]:text-[70px] min-[1920px]:tracking-[-2.11px]";
const ROW_GAP =
  "gap-[22px] min-[768px]:gap-[33px] min-[1440px]:gap-[44px] min-[1920px]:gap-[48px]";
const LIST_GAP =
  "gap-[40px] min-[768px]:gap-[60px] min-[1440px]:gap-[80px] min-[1920px]:gap-[88px]";
const LIST_WIDTH =
  "max-w-[297px] min-[768px]:max-w-[450px] min-[1440px]:max-w-[594px] min-[1920px]:max-w-[653px]";

/**
 * Phase 2 — 연혁 섹션.
 * 좌측: 선택된 연도의 무빙포스터 반복재생. 우측: 연도별 타이틀 리스트(최신연도가 하단).
 * Figma 실측 결과 선택 여부로 글자 크기나 굵기는 안 바뀌고(항상 ExtraBold, 항상 같은
 * 크기), 오직 불투명도만 선택 연도 기준 거리에 따라 단계적으로 낮아짐.
 */
export default function Phase2Timeline({ exhibitions }: Props) {
  const latestYear = exhibitions[0]?.year;
  const [selectedYear, setSelectedYear] = useState<number | undefined>(latestYear);

  const selected =
    exhibitions.find((ex) => ex.year === selectedYear) ?? exhibitions[0];

  // 오래된 연도 → 최신 연도 순으로 아래에서 위로 쌓이도록 표시
  const listOldestFirst = [...exhibitions].reverse();

  const opacityForDistance = (distance: number) => {
    if (distance === 0) return 1;
    if (distance === 1) return 0.3;
    if (distance === 2) return 0.15;
    return 0;
  };

  return (
    <section className="flex flex-col items-center gap-10 px-6 py-24 md:flex-row md:items-center md:justify-center md:gap-20 md:px-12 lg:px-[93px]">
      {/* Figma 실측: 467x660(1440), 513.7x725.2(1920), 317.3x448(모바일) — 전부 467:660 비율 */}
      <div className="relative aspect-[467/660] w-[317px] shrink-0 overflow-hidden rounded-sm bg-foreground/5 min-[768px]:w-[390px] min-[1440px]:w-[467px] min-[1920px]:w-[514px]">
        {selected?.movingPosterSrc ? (
          <video
            key={selected.movingPosterSrc}
            src={selected.movingPosterSrc}
            autoPlay
            loop
            muted
            playsInline
            className="size-full object-cover"
          />
        ) : selected?.posterSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={selected.posterSrc}
            alt={`${selected.year} 포스터`}
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-sm text-muted">
            {selected?.year}
          </div>
        )}
      </div>

      <ul className={`flex w-full flex-col items-end text-right ${LIST_WIDTH} ${LIST_GAP}`}>
        {listOldestFirst.map((ex) => {
          const distance = Math.abs((selectedYear ?? latestYear ?? ex.year) - ex.year);
          return (
            <li key={ex.year}>
              <button
                type="button"
                onClick={() => setSelectedYear(ex.year)}
                style={{ opacity: opacityForDistance(distance) }}
                className={`flex items-start transition-opacity duration-300 ${ROW_GAP}`}
              >
                <span
                  className={`font-display font-light leading-none text-foreground ${YEAR_TEXT}`}
                >
                  {ex.year}
                </span>
                <span
                  className={`font-display font-extrabold text-foreground ${TITLE_TEXT}`}
                  style={{ lineHeight: 0.8 }}
                >
                  {ex.titleEn || ex.titleKo}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
