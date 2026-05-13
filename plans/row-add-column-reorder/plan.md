# 행 추가 및 헤더 드래그(열 순서 변경) 구조 개선

**Branch:** `feature-row-add-column-reorder`
**Description:** 행 추가와 헤더 드래그(열 순서 변경) 기능을 성능과 유지보수성을 고려한 구조로 설계 및 구현

## Goal

- 대규모 데이터에서도 성능 저하 없이 행 추가와 열 순서 변경(헤더 드래그) 기능을 제공한다.
- 기존 GridRow 방식의 한계를 극복하고, 확장성과 유지보수성을 높인다.

## Implementation Steps

### Step 1: 행/열 정의 및 상태 관리 구조 개선

**Files:** grid/src/components/GridContainer.tsx, grid/src/store/gridStore.ts, grid/src/types/types.ts
**What:**

- 행/열 정의를 상위 컨테이너에서 useState로 일원화하여 관리
- 각 행/열에 고유 key 부여(예: uuid)
- 기존 props 기반 전달 구조를 상태 기반으로 개선
  **Testing:**
- 행/열 추가/삭제/수정 시, 하위 컴포넌트가 정상적으로 렌더링되는지 확인

### Step 2: 행 추가 기능 구현

**Files:** grid/src/components/GridContainer.tsx, grid/src/components/GridBody.tsx, grid/src/components/GridRow.tsx
**What:**

- "행 추가" 버튼 및 핸들러 구현해
- 새 행 객체 생성 및 상태에 추가, key 관리
- GridBody/Row/Cell이 새 행을 정상적으로 렌더링하는지 확인
  **Testing:**
- 여러 번 행 추가 시, 각 행이 고유하게 렌더링되는지 확인
- 대규모 데이터에서 성능 테스트

### Step 3: 헤더 드래그로 열 순서 변경 기능 구현

**Files:** grid/src/components/GridHeader.tsx, grid/src/components/GridContainer.tsx, grid/src/types/types.ts
**What:**

- DnD 라이브러리(react-dnd 또는 @dnd-kit) 적용
- 열 정의 배열의 순서 변경 로직 구현 및 상태 반영
- GridHeader/Row/Cell이 변경된 열 순서에 맞게 렌더링되는지 확인
  **Testing:**
- 헤더 드래그 시 열 순서가 즉시 반영되는지 확인
- 대규모 데이터에서 성능 테스트

### Step 4: 가상화 및 메모이제이션 적용

**Files:** grid/src/components/GridBody.tsx, grid/src/components/GridRow.tsx, grid/src/components/GridCell.tsx
**What:**

- react-window 등 가상화 라이브러리 적용
- React.memo, useMemo, useCallback 등 메모이제이션 적용
  **Testing:**
- 수천 개 행/열에서 렌더링 성능 측정
- 불필요한 리렌더링이 없는지 React DevTools로 확인

### Step 5: 통합 테스트 및 문서화

**Files:** grid/README.md, plans/virtualized-data-callback-management/plan.md
**What:**

- 전체 기능 통합 테스트
- 구조 및 사용법 문서화
  **Testing:**
- 모든 기능이 정상 동작하는지 시나리오별 테스트
- 문서에 따라 개발자가 쉽게 구조를 이해할 수 있는지 확인
