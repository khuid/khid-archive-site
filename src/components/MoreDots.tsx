import type React from "react";

type Props = {
  /** vertical: Phase 2 연혁 맨 위 / horizontal: Phase 3 그리드 맨 끝 */
  direction: "vertical" | "horizontal";
  /** 점 한 변(px). 점 사이 간격도 같은 값 */
  size?: number;
  className?: string;
  style?: React.CSSProperties;
};

/**
 * "…" 말줄임 점 3개 — 가장 오래된 연도 바깥에 붙여서 그 이전 졸업전시도 있지만
 * 아카이브는 여기서부터라는 뜻을 전달. 기본 5×5px 흰색 30%, 선택·클릭 안 됨(장식).
 */
export default function MoreDots({ direction, size = 5, className = "", style }: Props) {
  return (
    <span
      aria-hidden="true"
      style={{ gap: size, ...style }}
      className={`pointer-events-none flex ${direction === "vertical" ? "flex-col" : "flex-row"} ${className}`}
    >
      {[0, 1, 2].map((i) => (
        <span key={i} className="bg-white/30" style={{ width: size, height: size }} />
      ))}
    </span>
  );
}
