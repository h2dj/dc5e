import { Suspense } from "react";
import Brand from "@/components/Brand";
import ResultView from "@/components/ResultView";

export default function ResultPage() {
  return (
    <>
      <Brand />
      <Suspense fallback={<p className="py-10 text-center text-muted">결과를 불러오는 중…</p>}>
        <ResultView />
      </Suspense>
    </>
  );
}
