import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getLatestExhibition } from "@/lib/exhibitions";

// 링크 공유 미리보기(카카오톡·슬랙 등) 이미지: 검은 배경 가운데에 최신 연도 초대장만.
// 새 연도 폴더가 추가되면 그해 초대장으로 자동으로 바뀜
export const alt = "KHID Online Graduation Exhibition Archive";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// 초대장 PNG(정사각형, 바깥 투명 여백 포함)를 그릴 한 변 길이. 위아래 여백 15px씩
const INVITATION_SIZE = 600;

export default async function Image() {
  const latest = getLatestExhibition();
  const invitationSrc = latest?.invitationSrc
    ? `data:image/${latest.invitationSrc.endsWith(".png") ? "png" : "jpeg"};base64,${await readFile(
        join(process.cwd(), "public", latest.invitationSrc),
        "base64",
      )}`
    : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#121212",
        }}
      >
        {invitationSrc && (
          // eslint-disable-next-line jsx-a11y/alt-text
          <img src={invitationSrc} width={INVITATION_SIZE} height={INVITATION_SIZE} />
        )}
      </div>
    ),
    size,
  );
}
