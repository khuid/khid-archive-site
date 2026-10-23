// 히어로 초대장 더미: 최신 연도는 반듯하게, 나머지는 가장 오래된 연도부터 +, -, +, - 순으로 번갈아 기울이고,
// 맨 아래(가장 오래된)와 맨 위(최신) 사이 카드들은 95%로 줄여서 아래 카드가 살짝씩 비쳐 보이게 함.
// 기울기 크기(1~3°)는 연도로 정해지는 의사 난수라 새로고침해도 같고, 서버·브라우저 렌더 결과도 같음.
// 새 연도가 추가되면 직전 최신 연도도 자기 기울기를 받음 (예: 2027이 생기면 2026은 -1.3°)
const PILE_SCALE = 0.95;
// 카드 크기·모양이 해마다 달라서 기본값으로는 너무 가려지거나 튀는 연도만 따로 조정.
// scale: 크기 배율, y: 세로 이동(더미 칸 높이 대비 %, +는 아래)
const PILE_ADJUST: Record<number, { scale?: number; y?: number }> = {
  2024: { scale: 0.98, y: 3 }, // 가로로 긴 어두운 카드라 위 카드들에 가려져서 키우고 아래로 내려 밑으로 보이게
  2025: { scale: 0.88 },
  2026: { scale: 0.97, y: -2 },
};
const PILE_MIN_TILT = 1;
const PILE_MAX_TILT = 3;

/** 기울기·축소가 없는 상태. 전환 때 함수 목록을 맞추려고 같은 형식으로 둠 */
export const PILE_FLAT = "translateY(0%) rotate(0deg) scale(1)";

/** index: 0 = 가장 오래된 연도, count - 1 = 최신 연도 */
export function pileTransform(year: number, index: number, count: number) {
  const x = Math.sin(year * 37.719) * 43758.5453;
  const size = PILE_MIN_TILT + (x - Math.floor(x)) * (PILE_MAX_TILT - PILE_MIN_TILT);
  const isLatest = index === count - 1;
  const tilt = isLatest ? 0 : ((index % 2 === 0 ? 1 : -1) * Math.round(size * 10)) / 10;
  const adjust = PILE_ADJUST[year] ?? {};
  const scale = adjust.scale ?? (index === 0 || isLatest ? 1 : PILE_SCALE);
  return `translateY(${adjust.y ?? 0}%) rotate(${tilt}deg) scale(${scale})`;
}
