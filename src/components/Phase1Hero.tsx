"use client";

import Image from "next/image";
import type { Exhibition } from "@/lib/exhibitions";

type Props = {
  exhibitions: Exhibition[];
};

/**
 * Phase 1 — header 아래 첫 화면.
 * 왼쪽: 연도별 초대장이 빠르게 쌓이는 인터랙션 (최신 연도가 위/가장 크게).
 * 오른쪽: KHID 타이틀 + 소개문 + 다가오는 전시 안내.
 */
export default function Phase1Hero({ exhibitions }: Props) {
  const latest = exhibitions[0];
  // 쌓이는 모션은 뒤(과거)부터 앞(최신) 순으로 보여주기 위해 역순으로 순회
  const stack = [...exhibitions].reverse();

  return (
    <section className="flex min-h-screen flex-col items-center justify-center gap-10 px-6 pt-24 pb-16 md:flex-row md:items-center md:gap-16 md:px-12 lg:px-[93px]">
      <div className="relative aspect-square w-full max-w-[280px] shrink-0 min-[640px]:max-w-[360px] min-[1024px]:max-w-[560px] min-[1920px]:max-w-[680px]">
        {stack.map((ex, i) => {
          const isLatest = i === stack.length - 1;
          const depth = stack.length - 1 - i; // 0 = 최신(맨 위), 커질수록 더 아래/오래된 카드
          const rotation = ((i * 37) % 13) - 6; // -6deg ~ +6deg, 연도마다 고정된 각도
          const scale = isLatest ? 1 : 0.94 - depth * 0.015;
          const offsetX = isLatest ? 0 : (i % 2 === 0 ? -1 : 1) * (6 + depth * 5);
          const offsetY = isLatest ? 0 : depth * 7;
          return (
            <div
              key={ex.year}
              className="absolute inset-0 origin-center animate-[stack-in_0.6s_ease-out_both] shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
              style={{
                zIndex: i,
                transform: `translate(${offsetX}px, ${offsetY}px) rotate(${rotation}deg) scale(${scale})`,
                animationDelay: `${i * 90}ms`,
              }}
            >
              {ex.invitationSrc ? (
                <Image
                  src={ex.invitationSrc}
                  alt={`${ex.year} ${ex.titleKo} 초대장`}
                  fill
                  sizes="(min-width: 1920px) 680px, (min-width: 1024px) 560px, (min-width: 640px) 360px, 280px"
                  className="object-cover"
                  priority={isLatest}
                />
              ) : (
                <div className="flex size-full items-center justify-center bg-foreground/5 text-xs text-muted">
                  {ex.year}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex w-full max-w-[530px] flex-col gap-10 text-foreground md:gap-[116px]">
        <div className="flex flex-col gap-6">
          <div className="leading-none">
            <p className="font-display text-[44px] font-bold tracking-[-1.3px] text-muted sm:text-[60px] lg:text-[80px] lg:tracking-[-2.4px]">
              KHID
            </p>
            <p className="font-display text-[26px] font-normal tracking-[-0.8px] sm:text-[38px] lg:text-[54px] lg:tracking-[-1.62px]">
              ONLINE GRADUATION EXHIBITION ARCHIVE
            </p>
          </div>
          <p className="max-w-[341px] font-sans text-[12px] leading-[1.3] tracking-[-0.48px] text-foreground">
            An online archive of Kyung Hee University Industrial Design
            graduation exhibitions. The archive brings together works across
            product, spatial, UX/UI, and mobility design. It captures the
            department&rsquo;s evolving perspectives and its exploration of
            new possibilities through AI-driven innovation.
          </p>
        </div>

        {latest && (
          <div className="flex flex-col gap-6">
            <p className="font-sans text-[20px] font-semibold leading-[1.3] tracking-[-0.8px]">
              UPCOMING EXHIBITION
              <br />
              INFORMATION
            </p>
            <div className="flex flex-col gap-3 leading-[1.3]">
              <div className="flex flex-col gap-1">
                <p className="font-sans text-[12px] tracking-[-0.48px]">
                  {latest.year}th Graduation Exhibition
                </p>
                <p className="font-sans text-[16px] font-semibold tracking-[-0.64px]">
                  &lt;{latest.titleEn || latest.titleKo}&gt;
                </p>
              </div>
              <a
                href={latest.href}
                className="font-sans text-[16px] font-semibold tracking-[-0.64px] underline underline-offset-4"
              >
                → VISIT {latest.year} ON-LINE EXHIBITION
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
