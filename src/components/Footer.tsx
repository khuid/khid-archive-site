import CopyText from "./CopyText";

/**
 * 페이지 맨 아래 푸터. 왼쪽: 저작권 표시(운영 주체 학과 + 작품 저작권은 각 작가에게 있음).
 * 오른쪽: 학과 주소·연락처(오른쪽 정렬, 전화번호·이메일은 누르면 복사). 모바일 구조(~1279)에서는 위아래로 쌓고 왼쪽 정렬.
 * 연도는 넣지 않음 — 해마다 자료가 쌓이는 아카이브라 연도 표기가 오히려 어색하고, 법적 효력은 동일.
 * 좌우 여백은 Phase 2·3과 동일(모바일 24 / 데스크탑 93).
 */
export default function Footer() {
  return (
    <footer className="px-6 pb-10 min-[1280px]:px-[93px] min-[1280px]:pb-14">
      <div className="flex flex-col gap-6 border-t border-foreground/15 pt-6 font-sans text-[12px] leading-[1.5] tracking-[-0.04em] text-muted min-[1280px]:flex-row min-[1280px]:justify-between min-[1280px]:text-[14px]">
        <div className="flex flex-col gap-1">
          <p>© Department of Industrial Design, Kyung Hee University. All rights reserved.</p>
          <p>All works are the property of their respective creators and may not be reproduced without permission.</p>
        </div>
        <address className="flex flex-col gap-3 not-italic min-[1280px]:items-end min-[1280px]:text-right">
          <p>
            경기도 용인시 기흥구 덕영대로 1732
            <br />
            경희대학교 국제캠퍼스 예술디자인대학 산업디자인학과 308호
          </p>
          <p className="flex flex-wrap gap-x-6 gap-y-1">
            <span>
              TEL<span className="mx-2">|</span>
              <CopyText text="031-201-2644" />
            </span>
            <span>
              EMAIL<span className="mx-2">|</span>
              <CopyText text="art2644@khu.ac.kr" />
            </span>
          </p>
        </address>
      </div>
    </footer>
  );
}
