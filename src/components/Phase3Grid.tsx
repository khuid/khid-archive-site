"use client";

import { useState } from "react";
import Image from "next/image";
import type { Exhibition } from "@/lib/exhibitions";

type Props = {
  exhibitions: Exhibition[];
};

// 카드 폭은 화면별로 다르게(가로 스크롤에 보이는 장수 조절), 프레임 높이(640)와
// 포스터 세로값(기본 520 / 호버·선택 600)은 Figma Component 13 실측 그대로 모든
// 화면에서 통일
const CARD_W =
  "w-[297px] min-[768px]:w-[360px] min-[1440px]:w-[424px] min-[1920px]:w-[466px]";
const GAP =
  "gap-[8px] min-[768px]:gap-[10px] min-[1440px]:gap-[12px] min-[1920px]:gap-[13px]";
// 600/520 = 1.1538...

/**
 * Phase 3 — 포스터 그리드(가로 스크롤 + 스냅).
 * Component13 실측: 프레임(바깥 박스) 424×640 고정, 포스터는 높이 기준 520(기본)/
 * 600(호버·선택)이고 가로폭은 각 이미지 원본 비율 그대로(object-contain, 크롭 없음
 * — 연도마다 포스터 원본 비율이 달라서 실제 보이는 가로폭도 서로 다를 수 있음, 이게
 * 맞는 동작). 640 프레임 안에 600이 들어가고도 여유(20px)가 남아서 잘릴 일이 없음.
 * "VISIT WEB SITE"는 이 프레임 바깥, 고정된 위치에 있어서 포스터가 커져도 안 가려짐.
 * 가로도 같이 커지는 만큼 옆 카드 쪽으로 살짝 걸칠 수 있어, 확대된 카드가 항상
 * 위에 보이도록 z-index를 올림.
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
                className={`group relative flex w-full flex-col items-center gap-4 py-10 ${
                  isRevealed ? "z-10" : "min-[1440px]:hover:z-10"
                }`}
              >
                {/* 프레임: Component13 실측대로 항상 424×640 고정 */}
                <div className="relative flex h-[640px] w-full items-center justify-center">
                  <div
                    className={`relative w-full origin-center h-[520px] transition-transform duration-300 ease-out will-change-transform ${
                      isRevealed
                        ? "scale-[1.1538]"
                        : "min-[1440px]:group-hover:scale-[1.1538]"
                    }`}
                  >
                    {ex.posterSrc ? (
                      <Image
                        src={ex.posterSrc}
                        alt={`${ex.year} ${ex.titleKo} 포스터`}
                        fill
                        sizes="(min-width: 1920px) 466px, (min-width: 1440px) 424px, (min-width: 768px) 360px, 297px"
                        className="object-contain shadow-[0px_0px_50px_0px_rgba(0,0,0,0.05)]"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center bg-foreground/5 text-sm text-muted">
                        {ex.year}
                      </div>
                    )}
                  </div>
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
