# 컬럼 드래그 앤 드롭 (Column Drag & Drop) 로직 정리

이 문서는 React-Grid에서 구현된 **컬럼 헤더 드래그를 통한 순서 변경 및 애니메이션 로직**의 구조와 핵심 원리를 설명합니다.

## 1. 개요 (Overview)

AG-Grid와 유사한 부드러운 컬럼 이동을 제공하기 위해 **논리적 상태값(Left, Width)**과 **고정된 DOM 렌더링 순서**를 결합하여 구현했습니다. 마우스를 드래그할 때 다른 컬럼의 영역에 진입하면 즉시 순서가 재배열되며, CSS `transition`을 통해 버벅임(Jitter) 없이 미끄러지듯 이동합니다.

---

## 2. 주요 흐름 (Flow)

### A. 상태 관리 (Zustand - `gridStore.ts`)

- `dragColumn (string | null)`: 현재 드래그(이동) 중인 컬럼의 고유 키(`key`).
- `dragPointer ({ x, y } | null)`: 현재 마우스 포인터의 화면상 좌표. (드래그 모달 위치 추적용)

### B. 이벤트 처리 (`useColumnOrder.ts` 훅)

1. **`mouseDown` (드래그 시작)**
   - 헤더 셀에서 마우스를 누르면 실행됩니다.
   - `dragColumn`과 `dragPointer`를 설정하여 드래그 상태를 활성화합니다.
   - 이벤트 시점의 그리드 컨테이너 위치(`headerRect`)를 기억합니다.

2. **`mouseMove` (드래그 중 및 타겟 판별)**
   - 마우스 좌표 이동에 따라 `dragPointer`를 지속적으로 업데이트합니다.
   - **(핵심) 타겟 판별**: `document.elementFromPoint`와 같은 시각적 DOM을 기반으로 충돌을 체크하지 않습니다. 대신, 마우스의 상대 좌표(`offsetX`)가 다른 컬럼의 데이터상 경계(x = `colLeft` 또는 `colLeft + colWidth`)에 진입했는지를 수식으로 판단합니다.
   - 이를 통해 애니메이션 중인 엘리먼트 위를 마우스가 스쳐 지나갈 때 발생하는 덜덜거림(Jitter) 오작동을 완벽하게 방지합니다.
   - 타겟 영역 진입 시, 컬럼 배열 구조를 변경(Splice & Insert)하고 모든 컬럼의 `left` 위치를 즉시 재계산하여 상태를 갱신합니다.

3. **`mouseUp` (드래그 종료)**
   - 마우스를 떼면 `dragColumn`과 `dragPointer`를 null/빈 문자열로 초기화하고 등록된 이벤트 리스너를 제거합니다.

---

## 3. 렌더링 및 애니메이션

### A. 고정된 DOM 렌더링 순서 (`GridHeader.tsx`, `GridRow.tsx`)

```tsx
{[...columns]
  .sort((a, b) => a.key.localeCompare(b.key))
  .map((col) => ( ... ))}
```

- 배열 순서가 바뀌었다고 해서 React가 실제 DOM 요소의 순서를 섞지 않도록, **컴포넌트 렌더링 전에 항상 `col.key`를 기준으로 알파벳순 정렬**합니다.
- DOM 트리의 구조는 그대로 유지된 상태에서 각 노드의 `style={{ left: col.left }}` 값만 변경되므로 **브라우저가 CSS `transition`을 취소하지 않고 완벽하게 수행**합니다.

### B. CSS 애니메이션 (`grid.css`)

- 모든 셀 요소는 `position: absolute`로 선언되어 오직 `left` 속성에 의해서만 좌우 위치가 결정됩니다.
- `transition: left 0.15s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.15s linear` 를 통해 빠르면서도 자연스럽게 감속되는 이동 효과를 부여합니다.

### C. 마지막 열 테두리(Border) 예외 처리

- DOM 요소가 고정되어 있으므로 CSS `:last-child`로는 맨 우측에 표기되는 컬럼을 선택할 수 없습니다.
- 렌더링 시점에 **논리적인 배열의 맨 끝(columns[columns.length - 1].key === col.key)** 요소인지 식별하여 `last-column` 클래스를 부여하고 `border-right: none`을 입힙니다.

---

## 4. 마우스 포인터 팔로워 (HeaderDragModal.tsx)

- 컬럼 명과 상태를 보여주는 작은 정보 창입니다.
- `useGridStore`의 `dragPointer` 값을 실시간으로 읽어와서 마우스 위치에 `fixed`로 띄워줍니다.
- 그리드 컴포넌트(`containerRef`)의 `BoundingClientRect` 크기를 기준으로, 마우스가 그리드 영역 바깥으로 벗어날 경우 **모달 창이 그리드 화면 밖으로 이탈하지 않도록** 경계값을 지정(Clamp)하여 X, Y 축별로 분리 추적할 수 있도록 설계되었습니다.
