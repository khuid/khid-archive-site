// 히어로 초대장 더미: 모든 연도를 -3~3° 사이로 기울이고, 맨 아래(가장 오래된) 카드 위로는
// 95%로 줄여서 아래 카드가 살짝씩 비쳐 보이게 함.
// 기울기는 연도로 정해지는 의사 난수라 새로고침해도 같고, 서버·브라우저 렌더 결과도 같음
const PILE_SCALE = 0.95;
const PILE_MAX_TILT = 3;

/** 기울기·축소가 없는 상태. 전환 때 함수 목록을 맞추려고 같은 형식으로 둠 */
export const PILE_FLAT = "rotate(0deg) scale(1)";

export function pileTransform(year: number, isBottom: boolean) {
  const x = Math.sin(year * 37.719) * 43758.5453;
  const tilt = Math.round(((x - Math.floor(x)) * 2 - 1) * PILE_MAX_TILT * 10) / 10;
  return `rotate(${tilt}deg) scale(${isBottom ? 1 : PILE_SCALE})`;
}
