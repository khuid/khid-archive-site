"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type React from "react";
import Image from "next/image";
import type { Exhibition } from "@/lib/exhibitions";
import { pileTransform } from "@/lib/pile";
import InvitationViewer from "./InvitationViewer";

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
  const timeline = getStackTimeline(stack.length);

  const sectionRef = useRef<HTMLElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const pileRef = useRef<HTMLDivElement>(null);

  // 쌓이는 모션 다시 재생: 각 카드의 CSS 애니메이션을 처음(delay 포함)부터 재시작
  const replayStack = useCallback(() => {
    stackRef.current
      ?.getAnimations({ subtree: true })
      .forEach((animation) => {
        animation.cancel();
        animation.play();
      });
  }, []);

  // 쌓이는 모션이 끝난 뒤 더미를 누르면 넘겨보기 열기 (모션 도중 누르면 무시).
  // 열려 있는 동안 히어로 더미는 숨기고, 넘겨보기 카드가 더미 자리에서 펼쳐졌다가 닫힐 때 돌아옴
  const [viewerOrigin, setViewerOrigin] = useState<DOMRect | null>(null);
  const openViewer = () => {
    const el = stackRef.current;
    if (!el) return;
    const stillStacking = el
      .getAnimations({ subtree: true })
      .some((animation) => animation.playState !== "finished");
    if (stillStacking) return;
    // 더미가 칸과 다른 크기로 그려지므로(아래 pileRef) 실제로 보이는 크기에서 펼쳐지게 함
    setViewerOrigin((pileRef.current ?? el).getBoundingClientRect());
  };

  // 다른 섹션으로 완전히 벗어났다가 Phase1으로 다시 돌아오면(30% 이상 보이면) 한 번 더 재생
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    let hasLeft = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          hasLeft = true;
        } else if (hasLeft && entry.intersectionRatio >= 0.3) {
          hasLeft = false;
          replayStack();
        }
      },
      { threshold: [0, 0.3] },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, [replayStack]);

  // 레이아웃 기준: 1024부터 데스크탑(가로 배치), 그 전은 전부 모바일(Figma 390)과 같은 세로 구조.
  // 데스크탑은 화면 높이 안에서 세로 가운데: 위 96(고정 헤더 56 + 40)·아래 40이라 헤더 아래 여백과 화면 아래 여백이 같아짐.
  // 데스크탑은 Figma 1440 값 × --u. 1024~1439는 --u = 화면 폭/1440이라 1440 시안을 그대로 줄인 비율이고
  // (작은 글자는 12px 아래로 안 내려감), 1440~는 --u = 1px로 시안 그대로, 1920~는 따로 지정한 1.1배 값.
  // 모바일(~1023)은 Figma 모바일(390) 실측값 × --m(1px = 시안 그대로).
  // 콘텐츠 폭이 단계별로 고정되고(514~767: ×1.25, 768~1023: ×1.43) 좌우 여백만 줄어들다가,
  // 여백이 32가 되는 514 아래로는 콘텐츠가 450에서 시작해 390의 시안 크기(342)까지 화면과 함께 연속으로 줄어듦
  // (--m을 1.25px → 1px로 직선 보간, 여백은 32 → 24). 그 아래는 시안 그대로.
  // 브레이크포인트를 전부 px로 쓴 이유: sm:/lg:(rem)와 min-[..px]를 섞으면 px 쪽이 먼저
  // 생성돼 순서가 꼬임(1920 값이 lg에 덮이는 문제가 있었음)
  return (
    <section
      ref={sectionRef}
      className="flex min-h-screen flex-col items-center justify-center gap-10 px-6 pt-24 pb-16 [--m:1px] min-[390px]:[--m:calc(1px_+_(100vw_-_390px)*0.002016)] min-[514px]:[--m:1.25px] min-[768px]:[--m:1.43px] min-[1024px]:flex-row min-[1024px]:gap-[calc(52*var(--u))] min-[1024px]:px-[calc(93*var(--u))] min-[1024px]:pb-10 min-[1024px]:[--u:calc(100vw/1440)] min-[1440px]:[--u:1px]"
    >
      {/* Figma 실측: 360×360(모바일), 660×660(1440), 726×726(1920) — 전부 정방형.
          모바일 구간은 360 × --m, 1024~1439는 660 × 화면 폭/1440 */}
      {/* 초대장 영역을 누르면(또는 키보드 Enter/Space) 넘겨보기 열기 */}
      <div
        ref={stackRef}
        role="button"
        tabIndex={0}
        aria-label="초대장 넘겨보기"
        onClick={openViewer}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openViewer();
          }
        }}
        style={{ visibility: viewerOrigin ? "hidden" : undefined }}
        className="relative aspect-square w-full max-w-[calc(360*var(--m))] shrink-0 cursor-pointer min-[1024px]:max-w-[calc(660*var(--u))] min-[1920px]:max-w-[726px]"
      >
        {/* 초대장 PNG는 각자 회전·위치가 들어간 660 정사각 투명 캔버스라 같은 자리에 겹침
            (오래된 연도부터 +/- 번갈아 기울기, 맨 아래·최신 사이 카드는 95% 축소 — lib/pile.ts).
            오래된 연도부터(23→24→25→26) 내려오며, 처음엔 빠르게·뒤로 갈수록 천천히 쌓임.
            내려오는 동안은 컬러, 다음 연도 카드가 위에 내려앉으면 회색조로 바뀜 (최신 연도는 컬러 유지).
            데스크탑은 Figma "이거" 프레임대로 칸 안에서 더미 전체를 87.8%로 줄이고 살짝 위로.
            모바일은 카드 4장이 보이는 끝까지 정방형 칸에 꼭 맞게 95.68%로 줄이고 가운데로(오른쪽 2.14%, 위 0.56%) */}
        <div
          ref={pileRef}
          className="absolute inset-0 translate-x-[2.14%] -translate-y-[0.56%] scale-[0.9568] min-[1024px]:translate-x-0 min-[1024px]:-translate-y-[0.95%] min-[1024px]:scale-[0.878]"
        >
          {stack.map((ex, i) => {
            const isLatest = i === stack.length - 1;
            const { delay, duration, grayAt } = timeline[i];
            const animations = [
              `stack-in ${duration}ms ${STACK_EASING} ${delay}ms both`,
            ];
            if (grayAt !== null) {
              animations.push(`to-gray ${GRAY_FADE_MS}ms ease-out ${grayAt}ms both`);
            }
            return (
              <div
                key={ex.year}
                className="absolute inset-0 will-change-transform"
                style={{ zIndex: i, animation: animations.join(", ") }}
              >
                {ex.invitationSrc ? (
                  // 바깥 div는 쌓이는 모션(transform)이 쓰고 있어서, 기울기·축소는 안쪽에 따로 줌
                  <div className="absolute inset-0" style={{ transform: pileTransform(ex.year, i, stack.length) }}>
                    <Image
                      src={ex.invitationSrc}
                      alt={`${ex.year} ${ex.titleKo} 초대장`}
                      fill
                      sizes="(min-width: 1920px) 726px, (min-width: 1024px) 660px, (min-width: 768px) 515px, (min-width: 640px) 450px, 360px"
                      className="object-contain"
                      priority={isLatest}
                    />
                  </div>
                ) : (
                  <div className="flex size-full items-center justify-center bg-foreground/5 text-xs text-muted">
                    {ex.year}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 폭 500 이하: 텍스트를 위 초대장 카드(모바일에선 칸에 꼭 맞음)보다 좌우 2px씩 안쪽으로.
          514~1023: 시안 폭 + 4px (UPCOMING EXHIBITION 한 줄 + 오른쪽 열 간격 18이 들어가게) */}
      <div className="flex w-full max-w-[calc(342*var(--m))] max-[501px]:max-w-[calc(min(360*var(--m),100%)_-_4px)] min-[514px]:max-w-[calc(342*var(--m)_+_4px)] flex-col gap-[calc(46.6*var(--m))] text-foreground min-[1024px]:max-w-[calc(530*var(--u))] min-[1024px]:gap-[calc(112*var(--u))] min-[1920px]:max-w-[583px] min-[1920px]:gap-[123.2px]">
        <div className="flex flex-col gap-[calc(16*var(--m))] min-[1024px]:gap-[calc(32*var(--u))] min-[1920px]:gap-[35.2px]">
          <div className="leading-none">
            <p className="font-display text-[length:calc(40*var(--m))] font-bold tracking-[-0.03em] text-muted min-[1024px]:text-[length:calc(80*var(--u))] min-[1920px]:text-[88px]">
              KHID
            </p>
            {/* Figma 실측 폭 + 양쪽정렬(마지막 줄 포함): 280(모바일, 28px), 530(1440, 54px), 583(1920, 59.4px) */}
            <p className="w-[calc(280*var(--m))] max-w-full text-justify [text-align-last:justify] font-display text-[length:calc(28*var(--m))] font-normal tracking-[-0.03em] min-[1024px]:w-[calc(530*var(--u))] min-[1024px]:text-[length:calc(54*var(--u))] min-[1920px]:w-[583px] min-[1920px]:text-[59.4px]">
              ONLINE GRADUATION EXHIBITION ARCHIVE
            </p>
          </div>
          {/* 390은 14px, 넓어지면 아래 "35th ~" 줄(12 × --m)과 같은 크기 */}
          <p className="text-justify font-sans text-[length:max(14px,calc(12*var(--m)))] leading-[1.3] tracking-[-0.04em] text-foreground min-[1024px]:w-[calc(406*var(--u))] min-[1024px]:max-w-full min-[1024px]:text-[length:max(12px,calc(14*var(--u)))] min-[1920px]:w-[446px] min-[1920px]:text-[15.342px]">
            An online archive of Kyung Hee University Industrial Design
            graduation exhibitions. The archive brings together works across
            product, spatial, UX/UI, and mobility design. It captures the
            department&rsquo;s evolving perspectives and its exploration of
            new possibilities through AI-driven innovation.
          </p>
        </div>

        {latest && (
          // Figma 모바일(67:7953): 좌측 제목 / 우측 정보 2열. 데스크탑은 세로 배치.
          // 2열일 때 두 열 사이 간격 고정: 514~ 18(제목 한 줄), 350~513 22(제목 두 줄), 350 미만 20(두 줄).
          // 오른쪽 열은 콘텐츠 끝까지 채움
          <div className="flex items-start gap-x-[22px] whitespace-nowrap max-[350px]:gap-x-5 min-[514px]:gap-x-[18px] min-[1024px]:flex-col min-[1024px]:justify-start min-[1024px]:gap-[calc(24*var(--u))] min-[1024px]:whitespace-normal min-[1920px]:gap-[26.4px]">
            {/* 514 미만(스마트폰)은 줄바꿈을 직접 넣어 두 줄(UPCOMING / EXHIBITION), 514~는 한 줄 —
                저절로 꺾이게 두면 글자 상자가 넓게 남아 오른쪽 열과 간격이 벌어짐 */}
            <p className="min-w-0 font-sans text-[length:calc(14*var(--m))] font-semibold leading-[1.3] tracking-[-0.04em] whitespace-normal min-[1024px]:text-[length:calc(21*var(--u))] min-[1920px]:text-[23.1px]">
              UPCOMING <br className="hidden max-[514px]:inline" />
              EXHIBITION
            </p>
            <div className="flex flex-1 flex-col gap-[calc(12*var(--m))] min-[1024px]:flex-none text-[length:calc(12*var(--m))] leading-[1.3] tracking-[-0.04em] min-[1024px]:gap-[calc(12*var(--u))] min-[1024px]:text-[length:max(12px,calc(14*var(--u)))] min-[1920px]:gap-[13.2px]">
              <div className="flex flex-col gap-[calc(2*var(--m))] min-[1024px]:gap-[calc(4*var(--u))] min-[1920px]:gap-[4.4px]">
                <p className="font-sans">{cohort}th Graduation Exhibition</p>
                <p className="font-sans font-semibold min-[1024px]:text-[length:max(12px,calc(16*var(--u)))] min-[1920px]:text-[17.6px]">
                  &lt;{latest.titleEn || latest.titleKo}&gt;
                </p>
              </div>
              {/* 연도별 키컬러(info.json keyColor) 글자 + 두꺼운 밑줄, hover 시 키컬러로 채움.
                  글자와 화살표 사이는 1em으로 고정 (1열·2열 레이아웃 모두 같은 비율).
                  버튼은 오른쪽 열 폭(콘텐츠 끝)까지, 화살표는 오른쪽 끝.
                  340 미만은 "ON-LINE"까지 넣으면 오른쪽 열이 넓어져 UPCOMING과 겹치므로 뺌 */}
              <a
                href={latest.href}
                style={
                  {
                    "--key": latest.keyColor ?? "var(--foreground)",
                    "--on-key": onKeyColor(latest.keyColor),
                  } as React.CSSProperties
                }
                className="group flex w-full items-center justify-between gap-[1em] border-b-[3px] border-(--key) px-[0.55em] py-[0.25em] font-sans font-semibold text-(--key) transition-colors duration-200 hover:bg-(--key) hover:text-(--on-key) min-[1024px]:text-[length:max(12px,calc(17*var(--u)))] min-[1920px]:text-[18.7px]"
              >
                <span>
                  VISIT {latest.year} <span className="max-[340px]:hidden">ON-LINE </span>EXHIBITION
                </span>
                <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">
                  →
                </span>
              </a>
            </div>
          </div>
        )}
      </div>
      {viewerOrigin && (
        <InvitationViewer
          exhibitions={exhibitions}
          originRect={viewerOrigin}
          onClosed={() => {
            setViewerOrigin(null);
            stackRef.current?.focus({ preventScroll: true });
          }}
        />
      )}
    </section>
  );
}

// 쌓이는 모션 타이밍(ms). 카드 순번(0 = 가장 오래된 연도)이 커질수록
// 내려오는 시간과 다음 카드까지의 간격이 함께 늘어나 점점 느려짐.
// 떨어지는 시간이 너무 짧으면(0.3초 등) 첫 몇 프레임에 거리 대부분을 건너뛰어 끊겨 보임.
// 그래서 시간 차이는 작게 두고, 느려지는 느낌은 주로 출발 간격으로 만듦
// 시간의 앞 78%가 내려오는 구간, 뒤 22%가 바운드라 바운드만큼 조금 늘림
const FIRST_DURATION_MS = 500;
const DURATION_GROWTH = 1.08; // 0.50s → 0.54s → 0.58s → 0.63s (전체 약 1.2초)
// 감속(easeOutCubic)과 바운드는 globals.css의 stack-in 키프레임 구간별로 들어 있어 여기선 linear
const STACK_EASING = "linear";
const FIRST_GAP_MS = 120;
const GAP_GROWTH = 1.8; // 다음 카드 출발 간격 0.12s → 0.22s → 0.22s
// 간격은 여기서 더 늘지 않음 (마지막 카드가 너무 늦게 출발하지 않도록 24→25 간격에서 멈춤)
const MAX_GAP_MS = 216;
// 다음 카드가 아래 카드를 약 3/4 덮은 시점(다음 카드 재생 시간 대비 비율)에 회색조 시작.
// 화면 높이 대비 카드 크기에 따라 약간 달라짐: 데스크탑 ~80%, 모바일 ~70% 덮였을 때
const COVERED_AT = 0.37;
const GRAY_FADE_MS = 400;

// 키컬러로 채워진 hover 상태의 글자색: 밝은 키컬러면 검정, 어두우면 흰색
function onKeyColor(hex?: string) {
  if (!hex) return "var(--background)";
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.55 ? "#121212" : "#ffffff";
}

function getStackTimeline(count: number) {
  const items: { delay: number; duration: number }[] = [];
  let start = 0;
  for (let i = 0; i < count; i++) {
    const duration = Math.round(FIRST_DURATION_MS * DURATION_GROWTH ** i);
    items.push({ delay: start, duration });
    start += Math.min(Math.round(FIRST_GAP_MS * GAP_GROWTH ** i), MAX_GAP_MS);
  }
  return items.map((item, i) => {
    const next = items[i + 1];
    return {
      ...item,
      grayAt: next ? Math.round(next.delay + next.duration * COVERED_AT) : null,
    };
  });
}
