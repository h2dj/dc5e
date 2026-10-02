import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "나의 디지털 기운 읽기",
  description:
    "공동체은행 빈고 × 공동체IT 워크숍 — 내가 가진 힘, 빌리고 싶은 힘, 공동체에서 쓰고 있는 힘을 음양오행에 빗대어 찾아봅니다.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fbf8f2",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-dvh antialiased">
        <div className="mx-auto flex min-h-dvh max-w-xl flex-col px-4 pb-10 sm:px-6">{children}</div>
      </body>
    </html>
  );
}
