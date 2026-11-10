/**
 * 홈 화면 최신 전시 안내 제목을 전시 기간(info.json startDate·endDate, 한국 시간)에 따라 바꿈.
 *   시작일 전        → UPCOMING EXHIBITION
 *   시작일~종료일    → ONGOING EXHIBITION
 *   종료일 다음 날~  → LATEST EXHIBITION (다음 연도 폴더가 추가될 때까지)
 * 날짜가 비어 있거나 형식이 틀리면 UPCOMING으로 둠.
 */
export type ExhibitionPhase = "UPCOMING" | "ONGOING" | "LATEST";

const DATE = /^\d{4}-\d{2}-\d{2}$/;

export function getExhibitionPhase(
  startDate: string | undefined,
  endDate: string | undefined,
  now: Date = new Date(),
): ExhibitionPhase {
  if (!startDate || !endDate || !DATE.test(startDate) || !DATE.test(endDate)) return "UPCOMING";
  const start = new Date(`${startDate}T00:00:00+09:00`);
  const afterEnd = new Date(`${endDate}T00:00:00+09:00`).getTime() + 24 * 60 * 60 * 1000;
  if (now < start) return "UPCOMING";
  if (now.getTime() < afterEnd) return "ONGOING";
  return "LATEST";
}
