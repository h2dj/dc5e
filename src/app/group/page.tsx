import { Suspense } from "react";
import Brand from "@/components/Brand";
import GroupView from "@/components/GroupView";

// 기획서의 /group/[sessionId] 를 정적 배포에서도 동작하도록 /group/?s=세션코드 로 구현한다.
export default function GroupPage() {
  return (
    <>
      <Brand />
      <Suspense fallback={<p className="py-10 text-center text-muted">불러오는 중…</p>}>
        <GroupView />
      </Suspense>
    </>
  );
}
