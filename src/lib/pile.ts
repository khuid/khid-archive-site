// 히어로 초대장 더미 배치. 최신 연도는 기울기 없이 가로 가운데·100%(위아래만 조정),
// 나머지 연도는 최신 카드 뒤로 색이 조금씩 보이도록 상하좌우·기울기·크기를 연도별로 지정.
// 2023~2026 값은 Figma "배치" 프레임(234:9535)에서 2026 카드 캔버스를 더미 칸으로 보고 옮긴 것.
// 지정값이 없는 연도는 가장 오래된 연도부터 +, -, +, - 로 1~3° 기울기(연도로 정해지는 의사 난수)와 95% 크기.
const PILE_SCALE = 0.95;
const PILE_MIN_TILT = 1;
const PILE_MAX_TILT = 3;

// scale: 크기 배율, x·y: 가운데에서 이동(더미 칸 한 변 대비 %, +는 오른쪽·아래), tilt: 기울기(°, +는 시계 방향).
// 최신 연도일 때는 y만 쓰고, 다음 해 카드가 올라와 최신이 아니게 되면 나머지 값도 적용
const PILE_LAYOUT: Record<number, { scale?: number; x?: number; y?: number; tilt?: number }> = {
  2023: { scale: 1.109, x: -2.2, y: -0.1, tilt: 1 },
  2024: { scale: 1.043, x: -4.2, y: -0.2, tilt: -2 },
  2025: { scale: 1.019, x: 0, y: 1.6, tilt: 3 },
  2026: { scale: 0.97, y: -1.1, tilt: -1.3 },
};

/** 기울기·이동·축소가 없는 상태. 전환 때 함수 목록을 맞추려고 같은 형식으로 둠 */
export const PILE_FLAT = "translate(0%, 0%) rotate(0deg) scale(1)";

/** index: 0 = 가장 오래된 연도, count - 1 = 최신 연도 */
export function pileTransform(year: number, index: number, count: number) {
  const layout = PILE_LAYOUT[year] ?? {};
  const y = layout.y ?? 0;
  if (index === count - 1) return `translate(0%, ${y}%) rotate(0deg) scale(1)`;

  const r = Math.sin(year * 37.719) * 43758.5453;
  const size = PILE_MIN_TILT + (r - Math.floor(r)) * (PILE_MAX_TILT - PILE_MIN_TILT);
  const tilt = layout.tilt ?? ((index % 2 === 0 ? 1 : -1) * Math.round(size * 10)) / 10;
  const scale = layout.scale ?? (index === 0 ? 1 : PILE_SCALE);
  return `translate(${layout.x ?? 0}%, ${y}%) rotate(${tilt}deg) scale(${scale})`;
}
