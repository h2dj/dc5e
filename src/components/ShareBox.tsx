"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

/** 결과 URL 복사·공유·QR. QR은 브라우저 안에서 그리며 외부 서비스를 쓰지 않는다. */
export default function ShareBox({ url, title }: { url: string; title: string }) {
  const [qr, setQr] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  useEffect(() => {
    QRCode.toDataURL(url, { margin: 1, width: 360, color: { dark: "#1f2933", light: "#ffffff" } })
      .then(setQr)
      .catch(() => setQr(""));
  }, [url]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt("아래 주소를 복사하세요", url);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <h3 className="font-bold">결과 공유</h3>
      <p className="mt-1 text-sm text-muted">이 링크를 열면 같은 결과가 다시 나타나요. 링크에는 세 오행 값만 들어 있어요.</p>
      <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        {qr && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={qr} alt="결과 링크 QR 코드" width={160} height={160} className="rounded-lg border border-line" />
        )}
        <div className="flex w-full flex-col gap-2">
          <p className="break-all rounded-lg bg-paper px-3 py-2 font-mono text-xs text-muted">{url}</p>
          <button type="button" onClick={copy} className="rounded-xl border border-line px-4 py-3 font-semibold">
            {copied ? "복사했어요 ✓" : "링크 복사"}
          </button>
          {canShare && (
            <button
              type="button"
              onClick={() => navigator.share({ title, url }).catch(() => undefined)}
              className="rounded-xl border border-line px-4 py-3 font-semibold"
            >
              다른 앱으로 공유
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
