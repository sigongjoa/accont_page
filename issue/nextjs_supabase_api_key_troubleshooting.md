## Next.js 서버 컴포넌트 `fetch` 및 Supabase API 키 관련 문제 해결 과정

### 문제 설명:

Next.js 애플리케이션에서 특정 페이지(예: `/mcp`, `/papers`, `/industry_codes`)가 데이터를 가져오지 못하고 오류를 발생시켰습니다. 반면, 다른 페이지(예: `/expenses`, `/subscriptions`)는 정상적으로 작동했습니다.

발생한 주요 오류는 다음과 같습니다:
1.  `connect ECONNREFUSED 127.0.0.1:3000`
2.  `TypeError: Failed to parse URL from /api/mcp` (또는 `/api/papers`, `/api/industry_codes`)
3.  `Error fetching [데이터]: Invalid API key` (Supabase에서 반환)

### 환경:

*   Next.js (버전 15.2.4)
*   Supabase (데이터베이스 및 인증)
*   `pnpm` (패키지 매니저)

### 디버깅 과정 및 발견 사항:

1.  **`ECONNREFUSED` 오류 분석:**
    *   **증상:** `app/mcp/page.tsx`에서 `fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/mcp`)`를 호출할 때 `ECONNREFUSED` 오류가 발생했습니다.
    *   **원인 파악:** `.env.local` 파일에 `NEXT_PUBLIC_BASE_URL="http://localhost:3000"`으로 설정되어 있었으나, 실제 Next.js 개발 서버는 `http://localhost:3001`에서 실행 중이었습니다. 클라이언트 측 코드가 잘못된 포트로 요청을 보내 연결이 거부되었습니다.
    *   **초기 시도:** `NEXT_PUBLIC_BASE_URL`을 `http://localhost:3001`로 변경했습니다.

2.  **`TypeError: Failed to parse URL` 오류 분석:**
    *   **증상:** `NEXT_PUBLIC_BASE_URL`을 변경한 후에도 `/mcp`, `/papers`, `/industry_codes` 페이지에서 `TypeError: Failed to parse URL from /api/mcp`와 같은 오류가 발생했습니다.
    *   **원인 파악:** Next.js 13+의 App Router에서 `use client` 지시어가 없는 컴포넌트는 **서버 컴포넌트**로 동작합니다. 서버 컴포넌트 내에서 `fetch`를 사용할 때는 Node.js 환경에서 실행되므로, 브라우저처럼 상대 경로를 자동으로 처리하지 못합니다. 따라서 `fetch('/api/mcp')`와 같은 상대 경로는 `Invalid URL` 오류를 발생시킵니다.
    *   **대조:** `app/expenses/page.tsx`와 `app/subscriptions/page.tsx`는 `use client` 지시어가 있어 **클라이언트 컴포넌트**로 동작하며, `fetch('/api/expenses')`와 같은 상대 경로를 사용해도 브라우저 환경에서 정상적으로 작동했습니다.
    *   **해결 방향 전환:** 서버 컴포넌트에서는 `process.env.NEXT_PUBLIC_BASE_URL`을 사용하여 `fetch` 호출 시 **절대 경로**를 명시적으로 구성해야 함을 확인했습니다. 이에 따라 `NEXT_PUBLIC_BASE_URL`을 다시 `http://localhost:3000`으로 설정하고, 해당 페이지들의 `fetch` 호출을 `fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/your-endpoint`)` 형태로 되돌렸습니다.

3.  **`Invalid API key` 오류 분석:**
    *   **증상:** URL 파싱 문제를 해결한 후, Supabase에서 `Invalid API key` 오류가 발생했습니다.
    *   **원인 파악:** 이 오류는 Supabase API 키(`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)가 Supabase 프로젝트의 실제 키와 일치하지 않거나, `.env.local` 파일에서 환경 변수가 올바르게 로드되지 않았을 때 발생합니다.
    *   **디버깅:** `app/api/mcp/route.ts` 파일에 `process.env.NEXT_PUBLIC_SUPABASE_URL`과 `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY`의 값을 직접 로그로 출력하도록 코드를 추가했습니다. 이를 통해 API 라우트가 실제로 어떤 환경 변수 값을 읽고 있는지 확인하여 `.env.local` 파일의 값과 Supabase 대시보드의 실제 키를 비교할 수 있었습니다.
    *   **최종 해결:** 로그를 통해 `.env.local` 파일에 설정된 Supabase API 키가 실제 Supabase 프로젝트의 키와 정확히 일치하지 않거나, 파일 내에서 중복되거나 잘못된 부분이 있었음을 확인하고 수정하여 문제를 해결했습니다.

### 해결책:

1.  **서버 컴포넌트 (`app/mcp/page.tsx`, `app/papers/page.tsx`, `app/industry_codes/page.tsx` 등):**
    *   `fetch` 호출 시 `process.env.NEXT_PUBLIC_BASE_URL`을 사용하여 **절대 경로**를 구성해야 합니다.
    *   예시: `const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/mcp`, { cache: 'no-store' });`
2.  **클라이언트 컴포넌트 (`app/expenses/page.tsx`, `app/subscriptions/page.tsx` 등):**
    *   `use client` 지시어가 있는 컴포넌트에서는 `fetch` 호출 시 **상대 경로**를 사용할 수 있습니다.
    *   예시: `const res = await fetch('/api/expenses');`
3.  **환경 변수 (`.env.local`):**
    *   `NEXT_PUBLIC_BASE_URL`은 Next.js 개발 서버가 실행되는 정확한 URL (예: `http://localhost:3000`)로 설정해야 합니다.
    *   `NEXT_PUBLIC_SUPABASE_URL`과 `NEXT_PUBLIC_SUPABASE_ANON_KEY`는 Supabase 프로젝트의 **실제 API 키와 정확히 일치**해야 합니다. `.env.local` 파일 내에서 중복되거나 오타가 없는지 주의 깊게 확인해야 합니다.
4.  **서버 재시작:**
    *   `.env.local` 파일이나 서버 측 코드(API 라우트, 서버 컴포넌트)를 변경한 후에는 **반드시 Next.js 개발 서버를 재시작**(`pnpm run dev`)해야 변경 사항이 적용됩니다.
