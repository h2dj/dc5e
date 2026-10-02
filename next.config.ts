import type { NextConfig } from "next";

// 정적 배포(서버 없이 동작)를 기본으로 한다. `npm run build` 결과는 out/ 에 생성된다.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
