/**
 * 홈 화면 최신 전시 안내 제목을 전시 기간(info.json startDate·endDate, 한국 시간)에 따라 바꿈.
 *   시작 전        → UPCOMING EXHIBITION
 *   시작~마감      → ONGOING EXHIBITION
 *   마감 뒤        → LATEST EXHIBITION (다음 연도 폴더가 추가될 때까지)
 * 날짜는 "YYYY-MM-DD" 또는 시각까지 "YYYY-MM-DD HH:mm".
 * 시각이 없으면 시작은 그날 0시, 마감은 그날 밤 12시(그날 하루 포함).
 * 날짜가 비어 있거나 형식이 틀리면 UPCOMING으로 둠.
 */
export type ExhibitionPhase = "UPCOMING" | "ONGOING" | "LATEST";

const DATE_TIME = /^(\d{4}-\d{2}-\d{2})(?: (\d{2}:\d{2}))?$/;
const DAY = 24 * 60 * 60 * 1000;

/** 한국 시간 기준 시각(ms). 시각이 없으면 그날 0시, 형식이 틀리면 undefined */
function kstTime(value: string | undefined): { ms: number; hasTime: boolean } | undefined {
  const match = DATE_TIME.exec(value ?? "");
  if (!match) return undefined;
  const ms = new Date(`${match[1]}T${match[2] ?? "00:00"}:00+09:00`).getTime();
  return Number.isNaN(ms) ? undefined : { ms, hasTime: Boolean(match[2]) };
}

export function getExhibitionPhase(
  startDate: string | undefined,
  endDate: string | undefined,
  now: Date = new Date(),
): ExhibitionPhase {
  const start = kstTime(startDate);
  const end = kstTime(endDate);
  if (!start || !end) return "UPCOMING";
  const endMs = end.hasTime ? end.ms : end.ms + DAY;
  if (now.getTime() < start.ms) return "UPCOMING";
  if (now.getTime() < endMs) return "ONGOING";
  return "LATEST";
}
