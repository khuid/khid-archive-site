"use client";

import { useState } from "react";
import type { Exhibition } from "@/lib/exhibitions";

type Props = {
  exhibitions: Exhibition[];
};

/**
 * Phase 2 — 연혁 섹션.
 * 좌측: 선택된 연도의 무빙포스터 반복재생. 우측: 연도별 타이틀 리스트(최신연도가 하단).
 * 선택 연도 기준으로 멀어질수록 텍스트 불투명도가 단계적으로 낮아짐.
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
      <div className="relative aspect-square w-full max-w-[280px] shrink-0 overflow-hidden rounded-sm bg-foreground/5 sm:max-w-[360px] lg:max-w-[467px] min-[1920px]:max-w-[514px]">
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

      <ul className="flex w-full max-w-[600px] flex-col items-end gap-2 text-right">
        {listOldestFirst.map((ex) => {
          const distance = Math.abs((selectedYear ?? latestYear ?? ex.year) - ex.year);
          const isSelected = ex.year === (selectedYear ?? latestYear);
          return (
            <li key={ex.year}>
              <button
                type="button"
                onClick={() => setSelectedYear(ex.year)}
                style={{ opacity: opacityForDistance(distance) }}
                className="flex items-baseline gap-4 py-1 transition-opacity duration-300"
              >
                <span className="font-sans text-sm text-muted">{ex.year}</span>
                <span
                  className={`font-display text-2xl sm:text-3xl lg:text-4xl ${
                    isSelected ? "font-bold text-foreground" : "font-normal"
                  }`}
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
