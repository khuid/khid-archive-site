"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type React from "react";
import Image from "next/image";
import type { Exhibition } from "@/lib/exhibitions";
import MoreDots from "./MoreDots";

type Props = {
  exhibitions: Exhibition[];
};

// 카드 폭은 화면별로 다르게(--w0: 가로 스크롤에 보이는 장수 조절), 거기에 화면 폭 맞춤 배율(--fit, useFitScale)을 곱함.
// 프레임 높이(640)와 포스터 세로값(기본 520 / 호버·선택 600)은 Figma Component 13 실측값을 아래 SCALE로 축소
const CARD_W = "w-[calc(var(--w0)*var(--fit,1))]";
// 카드 간격: 모바일 구조(~1023) 8px, 데스크탑 24px(1920도 1440과 동일)
const GAP = "gap-[8px] min-[1024px]:gap-[24px]";
// 말줄임 프레임 = 좌우 24 + 점(5px×3, 간격 5 → 25) = 73.
// 오른쪽은 프레임 여백 24 + 카드 간격(GAP: 8 / 24). 스크롤 끝에서 확실히 잡히도록 margin 대신 padding
const END_PAD = "pr-[32px] min-[1024px]:pr-[48px]";
// 600/520 = 1.1538...
// 데스크탑 Component13(424×640) 기준 수치를 카드 폭 비율(--k)로 축소해서 씀.
// Figma 모바일(Component 14~16): 296.8×448 = 정확히 0.7배 → 포스터 기본 top 28/높이 364,
// 선택 시 top 0/높이 420, VISIT은 431.2 지점(포스터 아래 11.2), 글자 14px.
// 768~1439(카드 360)는 360/424 ≈ 0.849배, 1440~(카드 424 이상)은 1배.
// 1024~1439도 카드가 360이라 0.849로 줄여야 포스터가 폭에 막히지 않고 가운데 기준으로 커짐
// 실제 쓰는 --k는 이 기본값(--k0)에 카드 폭과 같은 맞춤 배율(--fit)을 곱한 값
const SCALE =
  "[--w0:296.8px] [--k0:0.7] min-[768px]:[--w0:360px] min-[768px]:[--k0:0.849] min-[1440px]:[--w0:424px] min-[1440px]:[--k0:1] min-[1920px]:[--w0:466px] [--k:calc(var(--k0)*var(--fit,1))]";

// 스크롤 첫 화면 오른쪽 끝 카드가 이만큼(카드 폭 대비) 보이도록 맞춤.
// 포스터가 카드 안에서 좌우로 약 7%씩 비어 있어서, 범위 밖이면 거의 다 보이거나 거의 안 보여 넘길 수 있다는 게 안 드러남
const PEEK_MIN = 0.2;
const PEEK_MAX = 0.75;
const PEEK_TARGET = 0.3;

/**
 * 가로 목록이 넘길 수 있다는 걸 알 수 있게, 오른쪽 끝 포스터가 항상 일부 잘려 보이도록 카드 맞춤 배율(--fit)을 계산.
 * 기본 배율로 이미 적당히 잘려 보이면 그대로 두고, 전부 한 화면에 들어오면(넘길 게 없으면) 손대지 않음
 */
function useFitScale(count: number) {
  const listRef = useRef<HTMLUListElement>(null);
  const [fit, setFit] = useState<number | null>(null);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const measure = () => {
      const style = getComputedStyle(list);
      const w0 = parseFloat(style.getPropertyValue("--w0"));
      const gap = parseFloat(style.columnGap) || 0;
      const view = list.clientWidth;
      if (!w0 || !view) return;
      // 한 화면에 보이는 카드 수(소수). 끝의 점 프레임은 빼고 포스터만 셈
      const visible = (view + gap) / (w0 + gap);
      const peek = visible - Math.floor(visible);
      if (visible >= count || (peek >= PEEK_MIN && peek <= PEEK_MAX)) {
        setFit(null);
        return;
      }
      // 기본 크기에서 가장 덜 바뀌는 쪽(조금 키우거나 조금 줄이기)으로 n장 + PEEK_TARGET장이 보이게
      const whole = Math.max(1, Math.round(visible - PEEK_TARGET));
      const w = (view + gap) / (whole + PEEK_TARGET) - gap;
      setFit(w / w0);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => observer.disconnect();
  }, [count]);

  return { listRef, fit };
}

/**
 * Phase 3 — 포스터 그리드(가로 스크롤 + 스냅, 카드 간격 모바일 8px / 데스크탑 24px).
 * Component13 실측(데스크탑 기준, 모바일은 SCALE 비율로 축소): 프레임 424×640.
 * - 기본 상태: 포스터 상단에서 40px 띄워서 배치(520 높이)
 * - 호버/선택: 포스터가 top=0까지 올라붙으면서 600으로 커짐(위·아래로 동시에 확장)
 * "VISIT WEB SITE"는 포스터 바로 아래 16px 간격, 포스터·텍스트 모두 가로 가운데 정렬
 * — 포스터(600) + 간격(16) + 텍스트까지 전부 640 프레임 안에 들어옴(24px가 텍스트 자리).
 * 텍스트는 프레임 안의 고정된 자리(top: 616px)에 항상 예약돼 있어서(평소엔
 * 투명도 0으로 숨김) 포스터가 커져도 절대 가려지거나 밀리지 않음.
 * 포스터 가로폭은 object-contain으로 각 이미지 원본 비율 그대로(크롭 없음) —
 * 연도마다 포스터 원본 비율이 달라서 실제 보이는 가로폭도 서로 다를 수 있음, 정상 동작.
 * 포스터·프레임이 position:absolute 안에서만 움직이고 커져서(li/ul 레이아웃에 영향 없음)
 * top/height 전환이어도 리플로우 없이 부드러움.
 *
 * 포스터 클릭/탭 = 선택 토글(다시 누르면 선택 해제, 다른 카드 누르면 그쪽으로 전환).
 * 링크 이동은 오직 "VISIT WEB SITE" 글자를 직접 눌렀을 때만 일어남 — 포스터 자체는
 * 절대 페이지 이동을 일으키지 않음.
 *
 * 데스크탑(≥1024, 마우스): 호버 시 확대(순수 CSS, 선택 여부와 무관).
 * 태블릿·모바일(<1024, 터치): 호버 없이 탭으로 바로 확대+"VISIT WEB SITE" 노출.
 */
export default function Phase3Grid({ exhibitions }: Props) {
  const [revealedYear, setRevealedYear] = useState<number | null>(null);
  const { listRef, fit } = useFitScale(exhibitions.length);

  return (
    <section
      className={`px-6 py-24 min-[1024px]:px-[93px] ${SCALE}`}
      style={fit === null ? undefined : ({ "--fit": fit } as React.CSSProperties)}
    >
      {/* 가로 스크롤은 유지하고 스크롤바만 숨김 (Firefox: scrollbar-width / Chrome·Safari: ::-webkit-scrollbar) */}
      <ul ref={listRef} className={`flex snap-x snap-mandatory overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${GAP}`}>
        {exhibitions.map((ex) => {
          const isRevealed = revealedYear === ex.year;
          // 온라인 전시 주소(href)가 있는 연도만 VISIT 링크를 보여줌
          const showLink = isRevealed && !!ex.href;
          return (
            <li key={ex.year} className={`shrink-0 snap-start ${CARD_W}`}>
              <div
                className={`group relative block w-full py-[calc(40px*var(--k))] ${
                  isRevealed ? "z-10" : "min-[1024px]:hover:z-10"
                }`}
              >
                {/* 프레임: Component13 실측 424×640 × 카드 비율(--k) */}
                <div className="relative h-[calc(640px*var(--k))] w-full">
                  {/* 포스터 — 클릭하면 선택 토글(다시 누르면 해제), 페이지 이동은 안 함 */}
                  <button
                    type="button"
                    onClick={() => setRevealedYear(isRevealed ? null : ex.year)}
                    aria-label={`${ex.year} ${ex.titleKo} 포스터 ${isRevealed ? "선택 해제" : "선택"}`}
                    className={`absolute inset-x-0 cursor-pointer transition-all duration-300 ease-out ${
                      isRevealed
                        ? "top-0 h-[calc(600px*var(--k))]"
                        : "top-[calc(40px*var(--k))] h-[calc(520px*var(--k))] min-[1024px]:group-hover:top-0 min-[1024px]:group-hover:h-[calc(600px*var(--k))]"
                    }`}
                  >
                    {ex.posterSrc ? (
                      <Image
                        src={ex.posterSrc}
                        alt={`${ex.year} ${ex.titleKo} 포스터`}
                        fill
                        sizes="(min-width: 1920px) 520px, (min-width: 1440px) 480px, (min-width: 768px) 420px, 340px"
                        className="object-contain object-top shadow-[0px_0px_50px_0px_rgba(0,0,0,0.05)]"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center bg-foreground/5 text-sm text-muted">
                        {ex.year}
                      </div>
                    )}
                  </button>
                  {/* 포스터(최대 600) + 16px 간격 지점에 고정 — 실제 이동 링크는 여기뿐 */}
                  <a
                    href={ex.href}
                    tabIndex={showLink ? 0 : -1}
                    className={`absolute inset-x-0 top-[calc(616px*var(--k))] text-center font-display text-[length:calc(20px*var(--k))] leading-none font-light tracking-[-0.04em] text-foreground underline underline-offset-4 transition-opacity duration-200 ${
                      showLink ? "opacity-100" : "pointer-events-none opacity-0"
                    }`}
                  >
                    VISIT WEB SITE
                  </a>
                </div>
              </div>
            </li>
          );
        })}
        {/* 맨 끝(가장 오래된 연도 다음)에 별도 프레임(좌우 24px + 점) — 가로 말줄임 점만 있고
            호버·선택 인터랙션 없음. 새 연도는 왼쪽에 추가되므로 항상 맨 끝에 남음.
            뒤에 카드 간격(GAP)만큼 여백을 더 둬서 점 오른쪽도 포스터 사이 간격과 같게 */}
        {exhibitions.length > 0 && (
          <li aria-hidden="true" className={`shrink-0 snap-end pl-[24px] ${END_PAD}`}>
            {/* 포스터 카드와 같은 세로 구조(위 40 + 포스터 기본 자리 520)에서 정중앙 */}
            <div className="py-[calc(40px*var(--k))]">
              <div className="h-[calc(640px*var(--k))] pt-[calc(40px*var(--k))]">
                <div className="flex h-[calc(520px*var(--k))] items-center">
                  <MoreDots direction="horizontal" />
                </div>
              </div>
            </div>
          </li>
        )}
      </ul>
    </section>
  );
}
