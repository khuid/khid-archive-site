"use client";

import { useState } from "react";
import Image from "next/image";
import type { Exhibition } from "@/lib/exhibitions";

type Props = {
  exhibitions: Exhibition[];
};

// Figma 실측(브레이크포인트별 카드폭/기본높이/확대높이/간격)
// 390: 297 / 364 / 420 / 8   |  768(코드 설계): 360 / 442 / 510 / 10
// 1440: 424 / 520 / 600 / 12  |  1920: 466 / 572 / 660 / 13
const CARD_W =
  "w-[297px] min-[768px]:w-[360px] min-[1440px]:w-[424px] min-[1920px]:w-[466px]";
const GAP =
  "gap-[8px] min-[768px]:gap-[10px] min-[1440px]:gap-[12px] min-[1920px]:gap-[13px]";
const POSTER_H_BASE =
  "h-[364px] min-[768px]:h-[442px] min-[1440px]:h-[520px] min-[1920px]:h-[572px]";
// 600/520 = 420/364 = 510/442 = 660/572 = 1.1538... 전 브레이크포인트 동일 배율

/**
 * Phase 3 — 포스터 그리드(가로 스크롤 + 스냅).
 * 모든 포스터는 카드 폭(CARD_W)을 항상 꽉 채우고(object-cover), 높이만
 * POSTER_H_BASE로 통일 — 원본 이미지 비율이 연도마다 달라도 전부 동일한 크기로 보임.
 * 확대는 `height`가 아니라 `transform: scaleY()`로 처리(레이아웃 리플로우 없이 부드럽게
 * 커짐) — scaleY만 쓰고 scaleX는 그대로 둬서 가로폭은 안 변하고(옆 카드와 안 겹침),
 * 세로로만 커지도록 함.
 *
 * 데스크탑(≥1440, 마우스): 호버 시 확대(순수 CSS). 클릭 시 "VISIT WEB SITE" 노출, 한 번 더 클릭 시 이동.
 * 태블릿·모바일(<1440, 터치): 호버 단계 없이 탭 1회로 바로 확대+"VISIT WEB SITE" 노출, 탭 1회 더로 이동.
 */
export default function Phase3Grid({ exhibitions }: Props) {
  const [revealedYear, setRevealedYear] = useState<number | null>(null);

  return (
    <section className="px-6 py-24 min-[768px]:px-12 min-[1440px]:px-[93px]">
      <ul className={`flex snap-x snap-mandatory overflow-x-auto pb-4 ${GAP}`}>
        {exhibitions.map((ex) => {
          const isRevealed = revealedYear === ex.year;
          return (
            <li key={ex.year} className={`shrink-0 snap-start ${CARD_W}`}>
              <a
                href={ex.href}
                onClick={(e) => {
                  if (!isRevealed) {
                    e.preventDefault();
                    setRevealedYear(ex.year);
                  }
                }}
                className="group flex flex-col items-center gap-4 py-10"
              >
                <div
                  className={`relative w-full origin-center transition-transform duration-300 ease-out will-change-transform ${POSTER_H_BASE} ${
                    isRevealed
                      ? "scale-y-[1.1538]"
                      : "min-[1440px]:group-hover:scale-y-[1.1538]"
                  }`}
                >
                  {ex.posterSrc ? (
                    <Image
                      src={ex.posterSrc}
                      alt={`${ex.year} ${ex.titleKo} 포스터`}
                      fill
                      sizes="(min-width: 1920px) 466px, (min-width: 1440px) 424px, (min-width: 768px) 360px, 297px"
                      className="object-cover shadow-[0px_0px_50px_0px_rgba(0,0,0,0.05)]"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center bg-foreground/5 text-sm text-muted">
                      {ex.year}
                    </div>
                  )}
                </div>
                <p
                  className={`font-display text-[20px] font-light tracking-[-0.8px] text-foreground underline underline-offset-4 transition-opacity duration-200 ${
                    isRevealed ? "opacity-100" : "opacity-0"
                  }`}
                >
                  VISIT WEB SITE
                </p>
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
