"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type React from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import type { Exhibition } from "@/lib/exhibitions";
import { PILE_FLAT, pileTransform } from "@/lib/pile";

type Props = {
  exhibitions: Exhibition[];
  /** 히어로 초대장 더미의 화면 위치 — 열릴 때 여기서 펼쳐지고 닫힐 때 여기로 돌아감 */
  originRect: DOMRect;
  /** 닫힘 모션이 끝난 뒤 호출 (이때 히어로 더미를 다시 보여줌) */
  onClosed: () => void;
};

// enter: 더미 자리 → 한 줄로 펼쳐지는 중 / row: 한 줄 보기 / single: 한 장 정면 / exit: 더미 자리로 돌아가는 중
type Phase = "enter" | "row" | "single" | "exit";

// 한 줄 보기: 모든 카드가 같은 각도로 왼쪽 모서리는 앞, 오른쪽 모서리는 안쪽으로 들어감
const ROW_ANGLE = 70;
// 마우스(손가락)가 가까이 오면 이만큼까지 펴짐. 바로 위 카드가 가장 많이, 양옆은 덜
const HOVER_OPEN = 14;
const HOVER_REACH = 1.6; // 펴짐이 퍼지는 범위 (카드 몇 장 거리까지)
// 카드 사이 간격 (카드 한 변 대비) — 돌아간 카드의 겉보기 폭(cos 70° ≈ 0.34)보다 좁게, 촘촘히 겹침
const ROW_GAP = 0.22;
// 마우스를 따라 묶음 전체가 좌우로 움직이는 최대 거리(px), 펴진 카드 오른쪽 카드들이 밀리는 거리(카드 한 변 대비)
const PARALLAX = 14;
const HOVER_PUSH = 0.05;
const MOTION = "cubic-bezier(0.22, 0.8, 0.24, 1)";
const MOTION_MS = 600;

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/**
 * 히어로 초대장 넘겨보기.
 * 왼쪽(오래된 연도) → 오른쪽(최신 연도)으로 같은 각도로 비스듬히 선 카드들이 한 줄로 서 있고,
 * 마우스(모바일은 손가락으로 쓸기)를 따라 묶음이 살짝 움직이며 가까운 카드가 조금 펴짐.
 * 카드를 누르면 정면으로 완전히 펴지며 크게, 펴지는 동시에 VISIT WEB SITE 링크도 나타남.
 * 바깥(어두운 부분)·ESC는 한 단계 뒤로, X는 바로 닫기. 열려 있는 동안 페이지 스크롤은 잠금.
 */
export default function InvitationViewer({ exhibitions, originRect, onClosed }: Props) {
  const cards = [...exhibitions].reverse();
  const count = cards.length;
  const lastIndex = count - 1;

  const [phase, setPhase] = useState<Phase>("enter");
  const [selected, setSelected] = useState(lastIndex);
  // 마우스·손가락이 가리키는 위치(카드 index 단위, 소수). null이면 아무 카드도 안 펴짐
  const [focus, setFocus] = useState<number | null>(null);
  const [pointerX, setPointerX] = useState<number | null>(null);
  const [viewport, setViewport] = useState(() => ({
    w: window.innerWidth,
    h: window.innerHeight,
  }));

  const closeButtonRef = useRef<HTMLButtonElement>(null);
  // 이벤트 핸들러(키보드)에서 최신 상태를 읽기 위한 거울
  const stateRef = useRef({ phase, focus });
  useLayoutEffect(() => {
    stateRef.current = { phase, focus };
  }, [phase, focus]);

  // 카드 한 변: 화면 높이의 60%, 최대 600, 그리고 한 줄 전체가 화면 폭의 88% 안에 들어가게
  const rowWidthFactor = lastIndex * ROW_GAP + 0.4;
  const size = Math.min(viewport.h * 0.6, 600, (viewport.w * 0.88) / rowWidthFactor);
  const singleSize = Math.min(viewport.h * 0.72, viewport.w * 0.92, 726);
  const gap = size * ROW_GAP;
  const linkGap = viewport.w >= 1280 ? 36 : 30; // 카드 아래 16 간격 + 링크 글자 높이

  const close = useCallback(() => {
    setFocus(null);
    setPhase("exit");
    window.setTimeout(onClosed, MOTION_MS);
  }, [onClosed]);

  const back = useCallback(() => {
    if (stateRef.current.phase === "single") {
      setPhase("row");
    } else if (stateRef.current.phase === "row") {
      close();
    }
  }, [close]);

  const select = useCallback((index: number) => {
    setSelected(index);
    setFocus(null);
    setPhase("single");
  }, []);

  // 열리자마자 더미 자리에서 한 줄로 펼침 (첫 프레임은 더미 자리로 그려야 모션이 보임)
  useEffect(() => {
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setPhase("row"));
    });
    closeButtonRef.current?.focus({ preventScroll: true });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, []);

  // 페이지 스크롤 잠금 — 닫으면 원래대로 (스크롤 위치는 그대로 유지)
  useEffect(() => {
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const onResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // 키보드: ESC 뒤로, 좌우 방향키로 펴질 카드 이동, Enter로 선택/링크 표시
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const { phase: ph, focus: f } = stateRef.current;
      if (e.key === "Escape") {
        e.preventDefault();
        back();
      } else if (ph === "row" && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
        e.preventDefault();
        const dir = e.key === "ArrowLeft" ? -1 : 1;
        setFocus(clamp(f === null ? lastIndex : Math.round(f) + dir, 0, lastIndex));
        setPointerX(null);
      } else if ((e.key === "Enter" || e.key === " ") && e.target === document.body) {
        e.preventDefault();
        if (ph === "row" && f !== null) select(Math.round(f));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [back, select, lastIndex]);

  // 화면 x 좌표 → 카드 index(소수). 묶음 가운데가 화면 가운데
  const indexAt = (clientX: number) => (clientX - viewport.w / 2) / gap + lastIndex / 2;

  // 마우스: 움직이면 따라감 / 손가락: 누른 채로 쓸면 따라감. 거의 안 움직이고 떼면 탭
  const pointer = useRef<{ id: number; x: number; y: number; card: number | null; moved: boolean } | null>(null);

  const track = (e: React.PointerEvent) => {
    if (stateRef.current.phase !== "row") return;
    setFocus(indexAt(e.clientX));
    setPointerX(e.clientX);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("a, button")) return;
    const cardEl = (e.target as HTMLElement).closest<HTMLElement>("[data-card]");
    pointer.current = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      card: cardEl ? Number(cardEl.dataset.card) : null,
      moved: false,
    };
    if (e.pointerType !== "mouse") track(e);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const p = pointer.current;
    if (p && p.id === e.pointerId && Math.hypot(e.clientX - p.x, e.clientY - p.y) > 10) {
      p.moved = true;
    }
    // 마우스는 그냥 움직여도, 손가락은 화면에 닿아 있을 때만 따라감
    if (e.pointerType === "mouse" || (p && p.id === e.pointerId)) track(e);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const p = pointer.current;
    if (!p || p.id !== e.pointerId) return;
    pointer.current = null;
    if (e.pointerType !== "mouse") {
      setFocus(null);
      setPointerX(null);
    }
    if (p.moved || e.type === "pointercancel") return;
    const { phase: ph } = stateRef.current;
    if (ph === "row") {
      if (p.card === null) close();
      else select(p.card);
    } else if (ph === "single") {
      // 펼친 카드를 누르면 그대로 유지, 바깥을 누르면 한 줄로 돌아감
      if (p.card !== selected) setPhase("row");
    }
  };

  const onPointerLeave = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse") {
      setFocus(null);
      setPointerX(null);
    }
  };

  // ── 카드 배치 계산 ──
  const originDx = originRect.left + originRect.width / 2 - viewport.w / 2;
  const originDy = originRect.top + originRect.height / 2 - viewport.h / 2;
  const originScale = originRect.width / size;
  const parallax = pointerX === null ? 0 : ((pointerX - viewport.w / 2) / viewport.w) * 2 * PARALLAX;
  // 카드마다 자기 원근을 따로 가져서 왼쪽 카드든 오른쪽 카드든 똑같은 각도로 보이게
  const perspective = `perspective(${size * 2}px)`;
  const openness = (i: number) =>
    focus === null ? 0 : clamp(1 - Math.abs(i - focus) / HOVER_REACH, 0, 1);

  const cardStyle = (i: number): React.CSSProperties => {
    const base = "translate(-50%, -50%)";
    // 더미 자리에서는 히어로와 같은 기울기·축소, 펼쳐지면 똑바로 (함수 목록을 맞춰야 부드럽게 이어짐)
    const flat = PILE_FLAT;
    if (phase === "enter" || phase === "exit") {
      return {
        transform: `${base} translate(${originDx}px, ${originDy}px) scale(${originScale}) ${perspective} rotateY(0deg) ${pileTransform(cards[i].year, i, count)}`,
        // 히어로 더미와 같게 최신 연도만 컬러
        filter: i === lastIndex ? "grayscale(0)" : "grayscale(1)",
        zIndex: i,
      };
    }
    if (phase === "single" && i === selected) {
      return {
        transform: `${base} translateY(${-linkGap / 2}px) scale(${singleSize / size}) ${perspective} rotateY(0deg) ${flat}`,
        filter: "grayscale(0)",
        zIndex: 2000,
      };
    }
    // 가리키는 위치와 가까울수록 많이 펴지고, 그보다 오른쪽 카드들은 펴진 만큼 살짝 밀림
    let push = 0;
    for (let j = 0; j < i; j++) push += openness(j) * size * HOVER_PUSH;
    const x = (i - lastIndex / 2) * gap + parallax + push;
    const angle = ROW_ANGLE - openness(i) * HOVER_OPEN;
    return {
      transform: `${base} translateX(${x}px) ${perspective} rotateY(${angle}deg) ${flat}`,
      filter: "grayscale(0)",
      zIndex: i,
      ...(phase === "single" ? { opacity: 0, pointerEvents: "none" as const } : {}),
    };
  };

  // 펼치기·정면 전환은 천천히, 마우스 따라가는 움직임은 짧게
  const following = phase === "row" && focus !== null;
  const transition = following
    ? "transform 350ms cubic-bezier(0.25, 1, 0.5, 1), opacity 300ms ease, filter 400ms ease"
    : `transform ${MOTION_MS}ms ${MOTION}, opacity 300ms ease, filter 400ms ease`;
  const active = cards[selected];

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="초대장 넘겨보기"
      className="fixed inset-0 z-[100] touch-none overscroll-none select-none"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerLeave={onPointerLeave}
    >
      {/* 초대장을 뺀 화면 전체를 어둡게 */}
      <div
        className="absolute inset-0 bg-black/90 transition-opacity duration-500"
        style={{ opacity: phase === "enter" || phase === "exit" ? 0 : 1 }}
      />

      {cards.map((ex, i) => (
        <div
          key={ex.year}
          data-card={i}
          className="absolute top-1/2 left-1/2 cursor-pointer will-change-transform"
          style={{ width: size, height: size, transition, ...cardStyle(i) }}
        >
          {ex.invitationSrc ? (
            <Image
              src={ex.invitationSrc}
              alt={`${ex.year} ${ex.titleKo} 초대장`}
              fill
              sizes="726px"
              draggable={false}
              className="pointer-events-none object-contain"
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-foreground/5 text-xs text-muted">
              {ex.year}
            </div>
          )}
        </div>
      ))}

      {/* 카드가 정면으로 펴질 때 같이 나타남(펴지는 모션 끝무렵에 페이드인) — Phase 3 포스터의 VISIT WEB SITE와 같은 형식 */}
      {active && (
        <a
          href={active.href}
          tabIndex={phase === "single" && active.href ? 0 : -1}
          className={`absolute left-1/2 -translate-x-1/2 font-display text-[16px] leading-none font-light tracking-[-0.04em] whitespace-nowrap text-foreground underline underline-offset-4 transition-opacity duration-200 min-[1280px]:text-[20px] ${
            phase === "single" && active.href ? "opacity-100 delay-300" : "pointer-events-none opacity-0"
          }`}
          style={{ top: `calc(50% + ${singleSize / 2 - linkGap / 2 + 16}px)`, zIndex: 3000 }}
        >
          VISIT WEB SITE
        </a>
      )}

      <button
        ref={closeButtonRef}
        type="button"
        aria-label="닫기"
        onClick={close}
        className="absolute top-3 right-3 z-[4000] flex size-11 items-center justify-center text-foreground transition-opacity duration-300 min-[1280px]:top-6 min-[1280px]:right-6"
        style={{ opacity: phase === "enter" || phase === "exit" ? 0 : 1 }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>
    </div>,
    document.body,
  );
}
