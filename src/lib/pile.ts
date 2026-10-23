// 히어로 초대장 더미: 모든 연도를 기울이되 가장 오래된 연도부터 +, -, +, - 순으로 번갈아 기울이고,
// 맨 아래(가장 오래된)와 맨 위(최신) 사이 카드들은 95%로 줄여서 아래 카드가 살짝씩 비쳐 보이게 함.
// 기울기 크기(1~3°)는 연도로 정해지는 의사 난수라 새로고침해도 같고, 서버·브라우저 렌더 결과도 같음
const PILE_SCALE = 0.95;
// 카드 크기·모양이 해마다 달라서 기본값으로는 너무 가려지거나 튀는 연도만 따로 조정
const PILE_SCALE_BY_YEAR: Record<number, number> = {
  2024: 0.98, // 가로로 긴 어두운 카드라 위 카드들에 거의 가려져서 조금 키움
  2025: 0.93,
};
const PILE_MIN_TILT = 1;
const PILE_MAX_TILT = 3;

/** 기울기·축소가 없는 상태. 전환 때 함수 목록을 맞추려고 같은 형식으로 둠 */
export const PILE_FLAT = "rotate(0deg) scale(1)";

/** index: 0 = 가장 오래된 연도, count - 1 = 최신 연도 */
export function pileTransform(year: number, index: number, count: number) {
  const x = Math.sin(year * 37.719) * 43758.5453;
  const size = PILE_MIN_TILT + (x - Math.floor(x)) * (PILE_MAX_TILT - PILE_MIN_TILT);
  const tilt = (index % 2 === 0 ? 1 : -1) * Math.round(size * 10) / 10;
  const scale = index === 0 || index === count - 1 ? 1 : (PILE_SCALE_BY_YEAR[year] ?? PILE_SCALE);
  return `rotate(${tilt}deg) scale(${scale})`;
}
