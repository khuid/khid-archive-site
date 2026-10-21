"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  text: string;
};

const TOAST_MS = 1600;

/**
 * 누르면 글자를 클립보드에 복사하고 화면 아래 가운데에 "복사되었습니다." 안내를 잠깐 띄움.
 * (푸터 전화번호·이메일 — 전화 걸기·메일 쓰기 대신 복사)
 */
export default function CopyText({ text }: Props) {
  const [shown, setShown] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // 클립보드 API가 막힌 환경(비보안 컨텍스트 등) 대비
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setShown(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setShown(false), TOAST_MS);
  };

  return (
    <>
      <button type="button" onClick={copy} className="cursor-pointer transition-colors duration-200 hover:text-foreground">
        {text}
      </button>
      <span
        role="status"
        className={`pointer-events-none fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-full bg-foreground px-4 py-2 font-sans text-[13px] leading-none tracking-[-0.04em] whitespace-nowrap text-background transition-opacity duration-300 ${
          shown ? "opacity-100" : "opacity-0"
        }`}
      >
        {shown ? "복사되었습니다." : ""}
      </span>
    </>
  );
}
