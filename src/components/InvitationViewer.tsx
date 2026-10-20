"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type React from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import type { Exhibition } from "@/lib/exhibitions";

type Props = {
  exhibitions: Exhibition[];
  /** 히어로 초대장 더미의 화면 위치 — 열릴 때 여기서 펼쳐지고 닫힐 때 여기로 돌아감 */
  originRect: DOMRect;
  /** 닫힘 모션이 끝난 뒤 호출 (이때 히어로 더미를 다시 보여줌) */
  onClosed: () => void;
};

// enter: 더미 자리 → 넘겨보기로 펼쳐지는 중 / fan: 넘겨보기 / single: 한 장 똑바로 / exit: 더미 자리로 돌아가는 중
type Phase = "enter" | "fan" | "single" | "exit";

// 넘겨보기에서 정면이 아닌 카드가 세로축으로 돌아가는 각도 (옆면이 보이는 정도)
const SIDE_ANGLE = 58;
// 정면 카드 중심 ~ 바로 옆 카드 중심 거리, 그 바깥 카드끼리 거리 (카드 한 변 대비 비율)
const FIRST_GAP = 0.42;
const NEXT_GAP = 0.13;
// 옆으로 돌아간 카드의 겉보기 반폭 (카드 한 변 대비, cos 58° ≈ 0.53의 절반)
const SIDE_HALF_WIDTH = 0.27;
const MOTION = "cubic-bezier(0.22, 0.8, 0.24, 1)";
const MOTION_MS = 600;

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/**
 * 히어로 초대장 넘겨보기.
 * 왼쪽 → 오른쪽 = 오래된 연도 → 최신 연도로 옆면을 보이며 서 있고, 가운데 한 장만 정면.
 * 좌우 스와이프·드래그, 휠/트랙패드, 방향키로 한 장씩 넘김. 카드를 누르면 한 장만 똑바로
 * 크게 보이고, 그 카드를 한 번 더 누르면 VISIT WEB SITE 링크가 나타남.
 * 바깥(어두운 부분)·ESC는 한 단계 뒤로, X는 바로 닫기. 열려 있는 동안 페이지 스크롤은 잠금.
 */
export default function InvitationViewer({ exhibitions, originRect, onClosed }: Props) {
  const cards = [...exhibitions].reverse();
  const count = cards.length;
  const lastIndex = count - 1;

  const [phase, setPhase] = useState<Phase>("enter");
  const [pos, setPos] = useState(lastIndex); // 정면 카드 index (처음엔 최신)
  const [dragDx, setDragDx] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [viewport, setViewport] = useState(() => ({
    w: window.innerWidth,
    h: window.innerHeight,
  }));

  const overlayRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  // 이벤트 핸들러(휠·키보드)에서 최신 상태를 읽기 위한 거울
  const stateRef = useRef({ phase, pos });
  useLayoutEffect(() => {
    stateRef.current = { phase, pos };
  }, [phase, pos]);

  // 넘겨보기 카드 한 변 / 한 장 보기 카드 한 변 (화면 크기에 맞춤)
  const size = Math.min(viewport.h * 0.6, viewport.w * 0.6, 600);
  const singleSize = Math.min(viewport.h * 0.72, viewport.w * 0.92, 726);
  const dragStep = size * 0.3; // 이만큼 끌면 한 장
  const linkGap = viewport.w >= 1280 ? 36 : 30; // 카드 아래 16 간격 + 링크 글자 높이

  const close = useCallback(() => {
    setRevealed(false);
    setPhase("exit");
    window.setTimeout(onClosed, MOTION_MS);
  }, [onClosed]);

  const back = useCallback(() => {
    if (stateRef.current.phase === "single") {
      setRevealed(false);
      setPhase("fan");
    } else if (stateRef.current.phase === "fan") {
      close();
    }
  }, [close]);

  const step = useCallback(
    (dir: number) => {
      if (stateRef.current.phase !== "fan") return;
      setPos((p) => clamp(p + dir, 0, lastIndex));
    },
    [lastIndex],
  );

  // 열리자마자 더미 자리에서 넘겨보기로 펼침 (첫 프레임은 더미 자리로 그려야 모션이 보임)
  useEffect(() => {
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setPhase("fan"));
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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const { phase: ph } = stateRef.current;
      if (e.key === "Escape") {
        e.preventDefault();
        back();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        step(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        step(1);
      } else if ((e.key === "Enter" || e.key === " ") && e.target === document.body) {
        e.preventDefault();
        if (ph === "fan") setPhase("single");
        else if (ph === "single") setRevealed(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [back, step]);

  // 휠/트랙패드: 아래로 = 이전(오래된) 연도, 위로 = 최신 쪽. 좌우 스와이프도 같은 방향 감각.
  // 한 번 넘긴 뒤에는 휠 입력이 잠깐 멈출 때까지 무시 → 관성 스크롤에도 한 장씩만 넘어감
  useEffect(() => {
    const el = overlayRef.current;
    if (!el) return;
    let acc = 0;
    let locked = false;
    let quietTimer = 0;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      window.clearTimeout(quietTimer);
      quietTimer = window.setTimeout(() => {
        locked = false;
        acc = 0;
      }, 160);
      if (locked || stateRef.current.phase !== "fan") return;
      acc += Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? -e.deltaY : e.deltaX;
      if (Math.abs(acc) > 30) {
        step(Math.sign(acc));
        locked = true;
        acc = 0;
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      window.clearTimeout(quietTimer);
    };
  }, [step]);

  // 손가락·마우스 공통 입력: 좌우로 끌면 카드가 따라 움직이다 놓으면 가까운 장으로 맞춤.
  // 거의 안 움직이고 떼면 탭으로 처리 (카드 위 → 선택/링크, 빈 곳 → 한 단계 뒤로)
  const pointer = useRef<{ id: number; x: number; card: number | null; dragging: boolean } | null>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("a, button")) return;
    const cardEl = (e.target as HTMLElement).closest<HTMLElement>("[data-card]");
    pointer.current = {
      id: e.pointerId,
      x: e.clientX,
      card: cardEl ? Number(cardEl.dataset.card) : null,
      dragging: false,
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const p = pointer.current;
    if (!p || p.id !== e.pointerId) return;
    const dx = e.clientX - p.x;
    if (!p.dragging && Math.abs(dx) > 8 && stateRef.current.phase === "fan") {
      p.dragging = true;
      overlayRef.current?.setPointerCapture(e.pointerId);
    }
    if (p.dragging) setDragDx(dx);
  };

  const finishPointer = (e: React.PointerEvent, cancelled: boolean) => {
    const p = pointer.current;
    if (!p || p.id !== e.pointerId) return;
    pointer.current = null;
    if (p.dragging) {
      const dx = e.clientX - p.x;
      setPos((current) => clamp(Math.round(current - dx / dragStep), 0, lastIndex));
      setDragDx(null);
      return;
    }
    if (cancelled) return;
    const { phase: ph, pos: current } = stateRef.current;
    if (ph === "fan") {
      if (p.card === null) {
        close();
      } else {
        setPos(p.card);
        setRevealed(false);
        setPhase("single");
      }
    } else if (ph === "single") {
      if (p.card === current) {
        setRevealed(true);
      } else {
        setRevealed(false);
        setPhase("fan");
      }
    }
  };

  // ── 카드 배치 계산 ──
  // 끄는 중이면 손가락을 따라 연속 위치, 아니면 정수 위치
  const livePos = dragDx === null ? pos : clamp(pos - dragDx / dragStep, -0.4, lastIndex + 0.4);

  const fanX = (r: number) => {
    const a = Math.abs(r);
    return Math.sign(r) * (a <= 1 ? a * size * FIRST_GAP : size * FIRST_GAP + (a - 1) * size * NEXT_GAP);
  };
  const halfWidth = (r: number) => {
    const t = Math.min(Math.abs(r), 1);
    return size * (0.5 * (1 - t) + SIDE_HALF_WIDTH * t);
  };
  // 펼쳐진 묶음 전체(양 끝 카드 바깥 모서리 기준)가 화면 가운데 오도록 이동
  const leftEdge = fanX(-livePos) - halfWidth(-livePos);
  const rightEdge = fanX(lastIndex - livePos) + halfWidth(lastIndex - livePos);
  const groupShift = -(leftEdge + rightEdge) / 2;

  const originDx = originRect.left + originRect.width / 2 - viewport.w / 2;
  const originDy = originRect.top + originRect.height / 2 - viewport.h / 2;
  const originScale = originRect.width / size;

  const cardStyle = (i: number): React.CSSProperties => {
    const base = "translate(-50%, -50%)";
    const atOrigin = phase === "enter" || phase === "exit";
    if (atOrigin) {
      return {
        transform: `${base} translate(${originDx}px, ${originDy}px) scale(${originScale})`,
        // 히어로 더미와 같게 최신 연도만 컬러
        filter: i === lastIndex ? "grayscale(0)" : "grayscale(1)",
        zIndex: i,
      };
    }
    const r = i - livePos;
    const a = clamp(r, -1, 1);
    const fan = `${base} translateX(${groupShift + fanX(r)}px) translateZ(${-Math.abs(a) * size * 0.3}px) rotateY(${a * SIDE_ANGLE}deg)`;
    const zIndex = 1000 - Math.round(Math.abs(r) * 10);
    if (phase === "single") {
      const isActive = i === pos;
      return isActive
        ? {
            transform: `${base} translateY(${-linkGap / 2}px) scale(${singleSize / size})`,
            filter: "grayscale(0)",
            zIndex: 2000,
          }
        : { transform: fan, filter: "grayscale(0)", opacity: 0, pointerEvents: "none", zIndex };
    }
    return { transform: fan, filter: "grayscale(0)", zIndex };
  };

  const transition =
    dragDx !== null
      ? "none"
      : `transform ${MOTION_MS}ms ${MOTION}, opacity 300ms ease, filter 400ms ease`;
  const active = cards[pos];

  return createPortal(
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label="초대장 넘겨보기"
      className="fixed inset-0 z-[100] touch-none overscroll-none select-none"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={(e) => finishPointer(e, false)}
      onPointerCancel={(e) => finishPointer(e, true)}
    >
      {/* 초대장을 뺀 화면 전체를 어둡게 */}
      <div
        className="absolute inset-0 bg-black/90 transition-opacity duration-500"
        style={{ opacity: phase === "enter" || phase === "exit" ? 0 : 1 }}
      />

      <div className="absolute inset-0" style={{ perspective: `${size * 3}px` }}>
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

        {/* 한 장 보기에서 카드를 한 번 더 누르면 나타남 — Phase 3 포스터의 VISIT WEB SITE와 같은 형식 */}
        {active && (
          <a
            href={active.href}
            tabIndex={phase === "single" && revealed ? 0 : -1}
            className={`absolute left-1/2 -translate-x-1/2 font-display text-[16px] leading-none font-light tracking-[-0.04em] whitespace-nowrap text-foreground underline underline-offset-4 transition-opacity duration-200 min-[1280px]:text-[20px] ${
              phase === "single" && revealed ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
            style={{ top: `calc(50% + ${singleSize / 2 - linkGap / 2 + 16}px)`, zIndex: 3000 }}
          >
            VISIT WEB SITE
          </a>
        )}
      </div>

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
