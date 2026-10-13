"use client";

import { useState } from "react";
import Image from "next/image";
import type { Exhibition } from "@/lib/exhibitions";

type Props = {
  exhibitions: Exhibition[];
};

/**
 * Phase 3 — 포스터 그리드(가로 스크롤 + 스냅).
 * 데스크탑(호버 가능 기기): 호버 시 포스터 확대(순수 CSS), 클릭 시 "VISIT WEB SITE" 노출, 한 번 더 클릭 시 이동.
 * 태블릿(세로)·모바일(터치): 호버 단계 없이 탭 1회로 바로 "VISIT WEB SITE" 노출, 탭 1회 더로 이동.
 * 두 경우 모두 "클릭 전까지는 링크를 따라가지 않는다"는 상태 전이는 동일한 로직으로 처리.
 */
export default function Phase3Grid({ exhibitions }: Props) {
  const [revealedYear, setRevealedYear] = useState<number | null>(null);

  return (
    <section className="px-6 py-24 md:px-12 lg:px-[93px]">
      <ul
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {exhibitions.map((ex) => {
          const isRevealed = revealedYear === ex.year;
          return (
            <li
              key={ex.year}
              className="shrink-0 snap-start"
              style={{ scrollSnapAlign: "start" }}
            >
              <a
                href={ex.href}
                onClick={(e) => {
                  if (!isRevealed) {
                    e.preventDefault();
                    setRevealedYear(ex.year);
                  }
                }}
                className="group flex w-[260px] flex-col items-center gap-4 py-10 sm:w-[300px] lg:w-[424px]"
              >
                <div
                  className={`relative aspect-[2897/4096] w-full overflow-hidden rounded-sm shadow-[0px_0px_50px_0px_rgba(0,0,0,0.05)] transition-transform duration-300 ${
                    isRevealed
                      ? "scale-[1.08]"
                      : "lg:group-hover:scale-[1.08]"
                  }`}
                >
                  {ex.posterSrc ? (
                    <Image
                      src={ex.posterSrc}
                      alt={`${ex.year} ${ex.titleKo} 포스터`}
                      fill
                      sizes="(min-width: 1024px) 424px, (min-width: 640px) 300px, 260px"
                      className="object-cover"
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
