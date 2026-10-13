import fs from "fs";
import path from "path";

export type Exhibition = {
  year: number;
  titleKo: string;
  titleEn: string;
  openingDate: string;
  venue: string;
  posterSrc?: string;
  invitationSrc?: string;
  movingPosterSrc?: string;
  href: string;
};

const EXHIBITIONS_DIR = path.join(process.cwd(), "public", "exhibitions");

/**
 * Scans public/exhibitions/{year}/ folders and builds the exhibition list.
 * A new year is picked up automatically the moment its folder is added —
 * no code changes needed. See public/exhibitions/_template/ for the format.
 */
export function getExhibitions(): Exhibition[] {
  if (!fs.existsSync(EXHIBITIONS_DIR)) return [];

  const years = fs
    .readdirSync(EXHIBITIONS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^\d{4}$/.test(entry.name))
    .map((entry) => entry.name)
    .sort((a, b) => Number(b) - Number(a)); // newest first

  const fileIfExists = (dir: string, year: string, filename: string) =>
    fs.existsSync(path.join(dir, filename))
      ? `/exhibitions/${year}/${filename}`
      : undefined;

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
      posterSrc: fileIfExists(dir, year, "poster.jpg"),
      invitationSrc: fileIfExists(dir, year, "invitation.jpg"),
      movingPosterSrc: fileIfExists(dir, year, "moving-poster.mp4"),
      href: `https://khid.archive.khu.ac.kr/${year}`,
    };
  });
}

export function getLatestExhibition(): Exhibition | undefined {
  return getExhibitions()[0];
}
