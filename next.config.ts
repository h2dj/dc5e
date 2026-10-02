import type { NextConfig } from "next";

// 정적 배포(서버 없이 동작)를 기본으로 한다. `npm run build` 결과는 out/ 에 생성된다.
// GitHub Pages 처럼 하위 경로(/dc5e)에 배포할 때는 NEXT_PUBLIC_BASE_PATH 로 경로를 지정한다.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || undefined;

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
