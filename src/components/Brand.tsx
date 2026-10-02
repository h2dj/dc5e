import Link from "next/link";

/** 공동체은행 빈고 + 공동체IT 표기. 공식 로고 파일이 있으면 public/bingo-logo.svg 로 교체할 수 있다. */
export default function Brand() {
  return (
    <header className="flex items-center justify-between py-4">
      <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-brand">
        <span
          aria-hidden
          className="grid h-8 w-8 place-items-center rounded-full bg-brand text-xs font-bold text-white"
        >
          빈고
        </span>
        <span>
          공동체은행 빈고 <span className="text-muted">× 공동체IT</span>
        </span>
      </Link>
    </header>
  );
}
