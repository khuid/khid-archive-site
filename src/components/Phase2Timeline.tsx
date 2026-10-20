"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
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
// 세로 배치(모바일 구간)는 390 기준 32px, 768은 같은 비율(×0.8)로 48px
const LIST_GAP =
  "gap-[32px] min-[768px]:gap-[48px] min-[1440px]:gap-[80px] min-[1920px]:gap-[88px]";
const LIST_WIDTH =
  "max-w-[297px] min-[768px]:max-w-[450px] min-[1440px]:max-w-[594px] min-[1920px]:max-w-[653px]";
// 무빙포스터(467:660 비율) 각 폭(317/390/467/514)에 대응하는 실제 높이값 —
// 데스크탑에서는 이 높이를 리스트 뷰포트에도 그대로 써서 선택된 연도가 영상 세로 중앙에 오도록 함
// 세로 배치(~1279)는 3개 항목만 보이므로 영상 높이 대신 3개 묶음에 맞춘 높이:
// 390 기준 172, 768은 글자 크기 비율(32→48, ×1.5)대로 258
const VIEWPORT_H =
  "h-[172px] min-[768px]:h-[258px] min-[1280px]:h-[551px] min-[1440px]:h-[660px] min-[1920px]:h-[726px]";
const VIDEO_W = "w-[317px] min-[768px]:w-[390px] min-[1440px]:w-[467px] min-[1920px]:w-[514px]";

// 무빙포스터 재생 볼륨 (0~1). 원본 음원이 커서 낮춰 재생
const VIDEO_VOLUME = 0.3;

/**
 * Phase 2 — 연혁 섹션.
 * 좌측: 선택된 연도의 무빙포스터 반복재생(화면에 보일 때만). 우측: 연도별 타이틀 리스트(최신연도가 하단).
 * 리스트는 무빙포스터와 같은 높이의 뷰포트 안에 있고, 선택된 연도 항목의 세로 중심이
 * 항상 그 뷰포트(=무빙포스터)의 세로 중앙에 오도록 translateY를 계산해서 맞춤.
 * Figma 실측 결과 선택 여부로 글자 크기나 굵기는 안 바뀌고(항상 ExtraBold, 항상 같은
 * 크기), 오직 불투명도만 선택 연도 기준 거리에 따라 단계적으로 낮아짐.
 */
export default function Phase2Timeline({ exhibitions }: Props) {
  const latestYear = exhibitions[0]?.year;
  const [selectedYear, setSelectedYear] = useState<number | undefined>(latestYear);
  const viewportRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Record<number, HTMLLIElement | null>>({});
  const [offset, setOffset] = useState(0);
  // 브라우저는 사용자 상호작용 전 "소리 있는" 자동재생을 막음 — 처음엔 음소거로
  // 자동재생하다가, 페이지 어디든 한 번이라도 클릭하면 그 이후로는 소리를 켬
  // (해당 연도 영상에 오디오 트랙이 없으면 음소거 여부와 무관하게 어차피 무음)
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    const unmute = () => setHasInteracted(true);
    document.addEventListener("click", unmute, { once: true });
    return () => document.removeEventListener("click", unmute);
  }, []);

  // 무빙포스터는 Phase 2 화면에 들어왔을 때만 재생하고, 벗어나면 일시정지
  // (영상 영역이 절반 이상 보이면 진입으로 봄). 다시 들어오면 멈춘 지점부터 이어서 재생
  const videoBoxRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const box = videoBoxRef.current;
    if (!box) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.5 },
    );
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  const selected =
    exhibitions.find((ex) => ex.year === selectedYear) ?? exhibitions[0];
  const activeYear = selectedYear ?? latestYear;

  // 오래된 연도 → 최신 연도 순으로 아래에서 위로 쌓이도록 표시
  const listOldestFirst = [...exhibitions].reverse();

  // 1280부터 데스크탑(가로 배치). 세로 배치에서는 항상 연속된 3개만 보여줌
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1280px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // 세로 배치용 3개 창: 선택 연도 ±1, 양 끝 연도면 반대쪽으로 2개를 채움
  // (예: 최신 26 선택 → 24·25·26 / 중간 24 선택 → 23·24·25)
  const activeIndex = listOldestFirst.findIndex((ex) => ex.year === activeYear);
  const windowStart = Math.max(
    0,
    Math.min(activeIndex - 1, listOldestFirst.length - 3),
  );
  const windowEnd = Math.min(listOldestFirst.length - 1, windowStart + 2);

  const opacityForDistance = (distance: number) => {
    if (distance === 0) return 1;
    if (distance === 1) return 0.3;
    if (distance === 2) return 0.15;
    return 0;
  };

  useLayoutEffect(() => {
    const recompute = () => {
      const viewport = viewportRef.current;
      if (!viewport) return;
      if (isDesktop) {
        // 데스크탑: 선택된 연도의 세로 중심을 뷰포트 가운데에
        const item = activeYear != null ? itemRefs.current[activeYear] : null;
        if (!item) return;
        const itemCenter = item.offsetTop + item.offsetHeight / 2;
        setOffset(viewport.clientHeight / 2 - itemCenter);
      } else {
        // 세로 배치: 보이는 3개 묶음 전체의 세로 중심을 뷰포트 가운데에
        const first = itemRefs.current[listOldestFirst[windowStart]?.year];
        const last = itemRefs.current[listOldestFirst[windowEnd]?.year];
        if (!first || !last) return;
        const groupCenter =
          (first.offsetTop + last.offsetTop + last.offsetHeight) / 2;
        setOffset(viewport.clientHeight / 2 - groupCenter);
      }
    };
    recompute();
    window.addEventListener("resize", recompute);
    return () => window.removeEventListener("resize", recompute);
    // listOldestFirst는 매 렌더 새 배열이라 의존성 대신 windowStart/End로 변화 감지
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeYear, isDesktop, windowStart, windowEnd]);

  // 화면 진입/이탈, 그리고 연도를 바꿔 새 영상이 들어왔을 때 재생 상태를 맞춤
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = VIDEO_VOLUME;
    if (inView) {
      // 자동재생 정책 등으로 막히면 조용히 무시 (다음 진입이나 클릭 때 다시 시도)
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [inView, selected?.movingPosterSrc]);

  // 1280부터 데스크탑(가로 배치), 그 전은 모바일과 같은 세로 구조
  return (
    <section className="flex flex-col items-center gap-6 px-6 py-24 min-[1280px]:flex-row min-[1280px]:items-start min-[1280px]:justify-center min-[1280px]:gap-20 min-[1280px]:px-[93px]">
      {/* Figma 실측: 467x660(1440), 513.7x725.2(1920), 317.3x448(모바일) — 전부 467:660 비율 */}
      <div ref={videoBoxRef} className={`relative aspect-[467/660] shrink-0 overflow-hidden bg-foreground/5 ${VIDEO_W}`}>
        {selected?.movingPosterSrc ? (
          <video
            key={selected.movingPosterSrc}
            ref={videoRef}
            src={selected.movingPosterSrc}
            loop
            muted={!hasInteracted}
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

      <div ref={viewportRef} className={`relative w-full overflow-hidden ${LIST_WIDTH} ${VIEWPORT_H}`}>
        <ul
          className={`absolute inset-x-0 top-0 flex w-full flex-col items-center text-right transition-transform min-[1280px]:items-end duration-500 ease-out ${LIST_GAP}`}
          style={{ transform: `translateY(${offset}px)` }}
        >
          {listOldestFirst.map((ex) => {
            const distance = Math.abs((activeYear ?? ex.year) - ex.year);
            const index = listOldestFirst.indexOf(ex);
            const inWindow = index >= windowStart && index <= windowEnd;
            const opacity = isDesktop
              ? opacityForDistance(distance)
              : inWindow
                ? opacityForDistance(distance)
                : 0;
            return (
              <li
                key={ex.year}
                ref={(el) => {
                  itemRefs.current[ex.year] = el;
                }}
              >
                <button
                  type="button"
                  onClick={() => setSelectedYear(ex.year)}
                  style={{ opacity, pointerEvents: opacity === 0 ? "none" : undefined }}
                  className={`flex items-start text-right transition-opacity duration-300 ${ROW_GAP}`}
                >
                  <span
                    className={`font-display font-light leading-none text-foreground ${YEAR_TEXT}`}
                  >
                    {ex.year}
                  </span>
                  <span
                    className={`font-display font-extrabold text-foreground ${TITLE_TEXT} flex flex-col items-end`}
                    style={{ lineHeight: 0.8 }}
                  >
                    {(ex.titleEn || ex.titleKo).split("\n").map((line, i) => (
                      <span key={i} className="w-fit">
                        {line}
                      </span>
                    ))}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
