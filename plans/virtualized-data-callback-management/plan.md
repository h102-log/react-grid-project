# Virtualized Data Callback Management

**Branch:** `virtualized-data-callback-management`
**Description:** 가상화 환경에서 data 콜백 패턴의 데이터 fetch, 상태/캐시 관리, 로딩/에러 UI, 가상화 연동을 직접 구현합니다.

## Goal
가상화된 그리드에서 data prop이 콜백 함수일 때, 필요한 데이터만 효율적으로 fetch하고 상태/캐시/로딩/에러 처리를 통해 대용량 데이터도 부드럽게 관리할 수 있도록 개선합니다.

## Implementation Steps

### Step 1: 데이터 fetch/캐시/상태 관리 훅 구현
**Files:** grid/src/hooks/useVirtualizedData.ts, types.ts, HGrid.tsx, GridBody.tsx
**What:** data가 콜백일 때 start~end 인덱스 구간별 fetch, 캐시, 로딩/에러 상태를 관리하는 커스텀 훅을 직접 구현합니다. (기본 캐시 구조만 설계, 정책은 추후 논의)
**Testing:** 훅 단위 테스트, start~end 요청 시 정상 fetch/캐시/에러 처리 확인

### Step 2: GridBody/Row 컴포넌트에서 훅 연동 및 UI 처리
**Files:** GridBody.tsx, GridRow.tsx, GridCell.tsx
**What:** 훅을 통해 fetch된 데이터로 row 렌더링, 로딩/에러/스켈레톤 UI 처리, 기존 배열/콜백 패턴 모두 지원
**Testing:** 콜백/배열 모두 정상 렌더, fetch 중 스켈레톤, 에러 시 메시지 노출 확인

### Step 3: 가상화 스크롤 연동 및 최적화(직접 구현)
**Files:** HGrid.tsx, GridBody.tsx
**What:** 스크롤 위치에 따라 필요한 구간만 fetch/렌더, 가상화 로직을 직접 구현(외부 라이브러리 미사용)
**Testing:** 대용량 데이터에서 스크롤 시 성능/정합성/중복 fetch 방지 확인

### Step 4: 공용 로딩/에러 컴포넌트 구현 및 적용
**Files:** grid/src/components/LoadingIndicator.tsx, grid/src/components/ErrorMessage.tsx, GridBody.tsx
**What:** 로딩바, 에러 메시지 등 공용 컴포넌트로 분리하여 fetch/렌더링 과정에 적용
**Testing:** fetch 중 로딩바, 에러 발생 시 메시지 정상 노출 확인
