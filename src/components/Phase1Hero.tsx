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
  // 기수 = 연도 - 1991 (2026년 = 35기)
  const cohort = latest ? latest.year - 1991 : 0;
  // 쌓이는 모션은 뒤(과거)부터 앞(최신) 순으로 보여주기 위해 역순으로 순회
  const stack = [...exhibitions].reverse();

  // 레이아웃 기준: 1280부터 데스크탑(가로 배치), 그 전은 전부 모바일(Figma 390)과 같은 세로 구조.
  // 모바일 구간은 Figma 모바일 실측값 × 배율(--s)로 통일해 화면이 커져도 같은 비율 유지:
  // 1(~639) → 1.25(640~) → 1.43(768~) → 1.55(1024~, 텍스트 칼럼이 데스크탑 폭 530에 도달).
  // 브레이크포인트를 전부 px로 쓴 이유: sm:/lg:(rem)와 min-[..px]를 섞으면 px 쪽이 먼저
  // 생성돼 순서가 꼬임(1920 값이 lg에 덮이는 문제가 있었음)
  return (
    <section className="flex min-h-screen flex-col items-center justify-center gap-10 px-6 pt-24 pb-16 [--s:1] min-[640px]:[--s:1.25] min-[768px]:[--s:1.43] min-[1024px]:[--s:1.55] min-[1280px]:flex-row min-[1280px]:gap-16 min-[1280px]:px-[93px]">
      {/* Figma 실측: 360×360(모바일), 660×660(1440), 726×726(1920) — 전부 정방형.
          모바일 구간은 360 × 배율, 1280~1439는 텍스트 칼럼(530)과 한 줄에 들어가도록 480 */}
      <div className="relative aspect-square w-full max-w-[calc(360px*var(--s))] shrink-0 min-[1280px]:max-w-[480px] min-[1440px]:max-w-[660px] min-[1920px]:max-w-[726px]">
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
                  sizes="(min-width: 1920px) 726px, (min-width: 1440px) 660px, (min-width: 1280px) 480px, (min-width: 1024px) 558px, (min-width: 768px) 515px, (min-width: 640px) 450px, 360px"
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

      <div className="flex w-full max-w-[calc(342px*var(--s))] flex-col gap-[calc(52px*var(--s))] text-foreground min-[1280px]:max-w-[530px] min-[1280px]:gap-[116px] min-[1920px]:max-w-[583px] min-[1920px]:gap-[127.6px]">
        <div className="flex flex-col gap-[calc(16px*var(--s))] min-[1280px]:gap-8 min-[1920px]:gap-[35.2px]">
          <div className="leading-none">
            <p className="font-display text-[length:calc(40px*var(--s))] font-bold tracking-[-0.03em] text-muted min-[1280px]:text-[80px] min-[1920px]:text-[88px]">
              KHID
            </p>
            {/* Figma 실측 폭 + 양쪽정렬: 280(모바일, 28px), 530(1440, 54px), 583(1920, 59.4px) */}
            <p className="w-[calc(280px*var(--s))] max-w-full text-justify font-display text-[length:calc(28px*var(--s))] font-normal tracking-[-0.03em] min-[1280px]:w-[530px] min-[1280px]:text-[54px] min-[1920px]:w-[583px] min-[1920px]:text-[59.4px]">
              ONLINE GRADUATION EXHIBITION ARCHIVE
            </p>
          </div>
          <p className="text-justify font-sans text-[length:calc(14px*var(--s))] leading-[1.3] tracking-[-0.04em] text-foreground min-[1280px]:w-[406px] min-[1280px]:max-w-full min-[1280px]:text-[14px] min-[1920px]:w-[446px] min-[1920px]:text-[15.342px]">
            An online archive of Kyung Hee University Industrial Design
            graduation exhibitions. The archive brings together works across
            product, spatial, UX/UI, and mobility design. It captures the
            department&rsquo;s evolving perspectives and its exploration of
            new possibilities through AI-driven innovation.
          </p>
        </div>

        {latest && (
          // Figma 모바일(67:7953): 좌측 제목 / 우측 정보 2열. 데스크탑은 세로 배치
          <div className="flex items-start justify-between whitespace-nowrap min-[1280px]:flex-col min-[1280px]:justify-start min-[1280px]:gap-6 min-[1280px]:whitespace-normal min-[1920px]:gap-[26.4px]">
            <p className="font-sans text-[length:calc(14px*var(--s))] font-semibold leading-[1.3] tracking-[-0.04em] min-[1280px]:text-[20px] min-[1920px]:text-[22px]">
              UPCOMING EXHIBITION
              <br />
              INFORMATION
            </p>
            <div className="flex flex-col gap-[calc(12px*var(--s))] text-[length:calc(12px*var(--s))] leading-[1.3] tracking-[-0.04em] min-[1280px]:gap-3 min-[1280px]:text-[14px] min-[1920px]:gap-[13.2px]">
              <div className="flex flex-col gap-[calc(2px*var(--s))] min-[1280px]:gap-1 min-[1920px]:gap-[4.4px]">
                <p className="font-sans">{cohort}th Graduation Exhibition</p>
                <p className="font-sans font-semibold min-[1280px]:text-[16px] min-[1920px]:text-[17.6px]">
                  &lt;{latest.titleEn || latest.titleKo}&gt;
                </p>
              </div>
              <a
                href={latest.href}
                className="font-sans font-semibold underline underline-offset-4 min-[1280px]:text-[16px] min-[1920px]:text-[17.6px]"
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
