import fs from "fs";
import path from "path";
import { createHash } from "crypto";

export type Exhibition = {
  year: number;
  titleKo: string;
  titleEn: string;
  openingDate: string;
  venue: string;
  /** 그해 키컬러(hex). VISIT 링크 색으로 쓰임 */
  keyColor?: string;
  posterSrc?: string;
  invitationSrc?: string;
  /** 테이프·클립 등 사물을 뺀 종이만 있는 초대장. 넘겨보기에서 카드가 옆으로 서 있을 때 쓰임 */
  invitationPlainSrc?: string;
  movingPosterSrc?: string;
  /** 온라인 전시 주소(info.json href). 없으면 VISIT 링크를 숨김 */
  href?: string;
};

const EXHIBITIONS_DIR = path.join(process.cwd(), "public", "exhibitions");

/**
 * Scans public/exhibitions/{year}/ folders and builds the exhibition list.
 * A new year is picked up automatically the moment its folder is added —
 * no code changes needed. See exhibition-template/ for the format.
 */
export function getExhibitions(): Exhibition[] {
  if (!fs.existsSync(EXHIBITIONS_DIR)) return [];

  const years = fs
    .readdirSync(EXHIBITIONS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^\d{4}$/.test(entry.name))
    .map((entry) => entry.name)
    .sort((a, b) => Number(b) - Number(a)); // newest first

  // 담당자가 jpg/png 어느 쪽으로 올려도 인식하도록 확장자 여러 개를 순서대로 확인
  const firstExisting = (dir: string, year: string, baseName: string, exts: string[]) => {
    for (const ext of exts) {
      const filename = `${baseName}.${ext}`;
      if (fs.existsSync(path.join(dir, filename))) {
        return `/exhibitions/${year}/${filename}`;
      }
    }
    return undefined;
  };

  return years.map((year) => {
    const dir = path.join(EXHIBITIONS_DIR, year);
    const infoPath = path.join(dir, "info.json");
    const info = fs.existsSync(infoPath)
      ? JSON.parse(fs.readFileSync(infoPath, "utf-8"))
      : {};

    return {
      year: Number(year),
      titleKo: info.titleKo ?? "",
      titleEn: info.titleEn ?? "",
      openingDate: info.openingDate ?? "",
      venue: info.venue ?? "",
      keyColor: /^#[0-9a-f]{6}$/i.test(info.keyColor ?? "") ? info.keyColor : undefined,
      posterSrc: firstExisting(dir, year, "poster", ["jpg", "jpeg", "png"]),
      // 초대장은 투명 배경 PNG(660 캔버스 2배)가 기준이라 png를 먼저 찾음
      invitationSrc: firstExisting(dir, year, "invitation", ["png", "jpg", "jpeg"]),
      invitationPlainSrc: firstExisting(dir, year, "invitation-plain", ["png", "jpg", "jpeg"]),
      movingPosterSrc: firstExisting(dir, year, "moving-poster", ["mp4"]),
      href: /^https?:\/\//.test(info.href ?? "") ? info.href : undefined,
    };
  });
}

export function getLatestExhibition(): Exhibition | undefined {
  return getExhibitions()[0];
}

/** 링크 미리보기 이미지 크기(og/route.tsx) */
export const LINK_PREVIEW_SIZE = { width: 1200, height: 630 };

/**
 * 링크 미리보기 이미지 주소에 붙일 버전값. 최신 초대장 파일 내용이 바뀌면 값도 바뀌어서
 * 카카오톡·슬랙 등이 예전 이미지를 캐시에서 계속 보여주는 걸 막음
 */
export function getLinkPreviewVersion(): string {
  const src = getLatestExhibition()?.invitationSrc;
  if (!src) return "none";
  const file = fs.readFileSync(path.join(process.cwd(), "public", src));
  return createHash("sha1").update(file).digest("hex").slice(0, 12);
}
