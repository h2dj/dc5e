# 나의 디지털 기운 읽기

공동체은행 빈고 × 공동체IT 워크숍 웹앱. 음양오행을 디지털 활동에 빗대어
**내 기운 → 빌리고 싶은 힘 → 공동체에서의 역할** 세 가지를 고르면,
5 × 5 × 5 = 125개 조합을 규칙 기반으로 해석합니다. 성격검사·운세가 아닌 워크숍용 은유입니다.

## 실행

```bash
npm install
npm run dev     # 개발 서버 http://localhost:3000
npm test        # 125개 조합 전수 테스트 등
npm run build   # 정적 사이트를 out/ 에 생성 → 아무 정적 호스팅(Netlify, Vercel, GitHub Pages 등)에 올리면 됨
```

## 화면

| 경로 | 내용 |
| --- | --- |
| `/` | 시작 화면. `/?s=모임코드` 로 들어오면 모임 코드를 기억 |
| `/select/self`, `/select/borrow`, `/select/community` | 3단계 오행 선택(이전 단계로 돌아가 수정 가능) |
| `/result?a=water&b=fire&c=wood` | 결과. URL만으로 같은 결과가 복원되며 링크 복사·QR 공유 지원 |
| `/group?s=모임코드` | [2차] 모임 전체 기운 지도(기획서의 `/group/[sessionId]`를 정적 배포용으로 쿼리스트링화) |

## 구조

- `src/data/*.json` — 오행 기본 문장, 관계 문장, 패턴 문장. **문구는 여기서만 고치면 됩니다.**
- `src/lib/relations.ts` — 상생·상극 매핑, `getRelation`, `getPattern`
- `src/lib/resultEngine.ts` — `buildResult(self, borrow, community)`: 오행 기본 문장 + A↔B 관계 + A↔C 관계 + 패턴 합성
- `src/lib/storage.ts` — 개인 선택값을 localStorage에만 저장(외부 전송 없음)
- `src/lib/group.ts`, `supabase/schema.sql` — 2차 모임 익명 집계

## 2차 기능(모임 결과) 켜기

1. Supabase 프로젝트를 만들고 SQL Editor에서 `supabase/schema.sql` 실행
2. 모임 세션 생성: `insert into workshop_sessions(id, title) values ('bingo-seoul-20261002', '빈고 경인권 조합원 모임');`
3. `.env.example`을 참고해 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 설정 후 빌드
4. 참가자에게 `/?s=bingo-seoul-20261002` 링크(QR)를 나눠주고, 진행자 화면에 `/group/?s=bingo-seoul-20261002` 띄우기
5. 마감: `update workshop_sessions set is_open = false where id = '...';`

환경변수가 없으면 모임 버튼이 숨겨지고 개인 결과 기능만 동작합니다.
응답에는 세 오행 값만 저장하고, 익명 사용자는 테이블에 직접 접근하지 못하며 집계 함수만 호출할 수 있습니다.
3명 미만이면 분포를 보여주지 않습니다.
