import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getLatestExhibition, LINK_PREVIEW_SIZE } from "@/lib/exhibitions";

// 링크 공유 미리보기(카카오톡·슬랙 등) 이미지: 사이트와 같은 배경색 가운데에 최신 연도 초대장만.
// 새 연도 폴더가 추가되거나 초대장 파일이 바뀌면 자동으로 바뀜.
// 주소(/og?v=…)는 layout.tsx에서 초대장 파일 내용으로 버전을 붙여서 메신저 캐시를 피함

// globals.css의 --background와 같은 색
const BACKGROUND = "#121212";

// 초대장 PNG(정사각형, 바깥 투명 여백 포함)를 그릴 한 변 길이. 위아래 여백 15px씩
const INVITATION_SIZE = 600;

// 파일을 동기로 읽어야 빌드 때 정적 이미지로 미리 만들어짐(비동기로 읽으면 요청마다 새로 그림)
export function GET() {
  const latest = getLatestExhibition();
  const invitationSrc = latest?.invitationSrc
    ? `data:image/${latest.invitationSrc.endsWith(".png") ? "png" : "jpeg"};base64,${readFileSync(
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
          background: BACKGROUND,
        }}
      >
        {invitationSrc && (
          // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
          <img src={invitationSrc} width={INVITATION_SIZE} height={INVITATION_SIZE} />
        )}
      </div>
    ),
    LINK_PREVIEW_SIZE,
  );
}
