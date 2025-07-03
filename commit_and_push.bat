@echo off
setlocal

REM 현재 브랜치 이름을 자동으로 가져옵니다.
for /f "delims=" %%i in ('git rev-parse --abbrev-ref HEAD') do set CURRENT_BRANCH=%%i

echo.
echo =====================================
echo  Git Commit and Push Script
echo =====================================
echo.

REM 모든 변경 사항을 스테이징합니다.
echo Adding all changes to staging area...
git add .
if %errorlevel% neq 0 (
    echo Error: Failed to add changes. Exiting.
    goto :eof
)
echo Changes added.

REM 커밋 메시지를 파일로 저장하고, 해당 파일을 사용하여 커밋합니다.
set "COMMIT_FILE=%TEMP%\git_commit_message.txt"

(
echo feat: 새로운 UI 디자인 적용 및 관련 문제 해결
echo.
echo 제공된 시각적 디자인에 맞춰 애플리케이션 전반에 걸쳐 포괄적인 UI 재설계를 구현했습니다.
echo.
echo - **전역 스타일 및 레이아웃:**
echo   - `globals.css`에 Noto Sans KR 및 Material Icons 폰트를 추가하고, 새로운 디자인에 맞는 Tailwind CSS 유틸리티 클래스를 정의했습니다.
echo   - `app/layout.tsx`의 전체 레이아웃 구조를 `flex h-screen`으로 재구성하고, Material Icons 폰트 로드를 위해 `<head>`에 직접 링크를 추가했습니다.
echo.
echo - **사이드바 및 헤더 재구성:**
echo   - `components/sidebar.tsx`를 재무 관리, 분석 ^& 자료, AI ^& 개발, 실전 개발 등 요청된 카테고리별로 메뉴를 그룹화했습니다.
echo   - `lucide-react` 아이콘을 Material Icons로 교체하고, 아이콘 렌더링 방식을 수정하여 텍스트로 표시되는 문제를 해결했습니다.
echo   - 사이드바 하단에 사용자 프로필 섹션을 추가하고, 모든 영어 텍스트를 한글로 번역했습니다.
echo   - `components/header.tsx`를 새로운 디자인에 맞춰 구조와 스타일을 변경했습니다.
echo.
echo - **페이지 및 테이블 컴포넌트 업데이트:**
echo   - `components/PageTitle.tsx`를 아이콘과 배지(badge)를 지원하도록 수정하고, 모든 페이지(`app/*/page.tsx`)에서 `Header` 컴포넌트 대신 `PageTitle`을 사용하도록 변경했습니다.
echo   - `site-table.tsx`, `ai-model-table.tsx`, `expense-table.tsx`, `industry-code-table.tsx`, `mcp-table.tsx`, `paper-table.tsx`, `repo-table.tsx`, `subscription-table.tsx` 등 모든 테이블 컴포넌트에 새로운 테이블 디자인을 적용했습니다.
echo   - `expense-filters.tsx`, `subscription-filters.tsx`, `ServiceCompatibilityMatrix.tsx` 필터 컴포넌트에도 새로운 디자인과 한글 번역을 적용했습니다.
echo.
echo - **버그 수정:**
echo   - Supabase API "Not Found" 오류를 해결하기 위해 `.env.local`의 `NEXT_PUBLIC_BASE_URL`을 올바른 포트(3001)로 업데이트했습니다.
echo   - `scripts/create-supabase-schema.sql`에 `mcp` 및 `industry_codes` 테이블 생성 SQL을 추가했습니다.
echo   - `components/sidebar.tsx`의 중복된 `Link` 임포트 오류를 수정했습니다.
echo   - `app/subscriptions/page.tsx`에 `"use client"` 지시어를 추가하여 React Hooks 관련 오류를 해결했습니다.
echo   - `components/subscription-filters.tsx`의 구문 오류를 수정했습니다.
) > %COMMIT_FILE%

echo Committing changes...
git commit -F %COMMIT_FILE%
if %errorlevel% neq 0 (
    echo Error: Failed to commit changes. Exiting.
    del %COMMIT_FILE%
    goto :eof
)
echo Changes committed.

REM 임시 커밋 메시지 파일 삭제
del %COMMIT_FILE%

REM 현재 브랜치로 푸시합니다.
echo Pushing to origin/%CURRENT_BRANCH%...
git push origin %CURRENT_BRANCH%
if %errorlevel% neq 0 (
    echo Error: Failed to push changes. Exiting.
    goto :eof
)
echo Push successful!

echo.
echo Script finished.
pause