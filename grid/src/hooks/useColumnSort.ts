// useColumnSort.ts
// 컬럼 정렬 관련 커스텀 훅 (구현 예정) 컬럼 헤드 드래그시 LEFT

import { useGridStore } from "../store/gridStore";
import { useMemo } from "react";
export const useColumnSort = () => {
  const {
    data,
    sortingColumn,
    sortDirection,
    setSortingColumn,
    setSortDirection,
  } = useGridStore();

  // 정렬된 데이터를 계산하는 useMemo 훅
  const sortedData = useMemo(() => {
    if (!sortingColumn || sortDirection === "none") return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortingColumn];
      const bVal = b[sortingColumn];

      if (aVal == null) return 1;
      if (bVal == null) return -1;

      const result = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortDirection === "asc" ? result : -result;
    });
  }, [data, sortingColumn, sortDirection]);

  // 컬럼을 클릭했을 때 정렬 상태를 업데이트하는 함수
  // [FLIP 아키텍처] 정렬 실행 직전 GridBody의 useLayoutEffect에서
  // 현재 virtualRow.start 위치들을 prevPositionsRef에 자동 캡처합니다.
  // (captureVirtualizerSnapshot 역할은 GridBody의 useLayoutEffect 타이밍으로 수행)
  const fnSetSortingColumn = (colKey: string) => {
    if (sortingColumn === colKey) {
      // 같은 컬럼을 클릭하면 정렬 방향 토글
      const newDirection =
        sortDirection === "asc"
          ? "desc"
          : sortDirection === "desc"
            ? "none"
            : "asc";
      setSortDirection(newDirection);
    } else {
      // 다른 컬럼을 클릭하면 해당 컬럼으로 정렬 시작
      setSortingColumn(colKey);
      setSortDirection("asc"); // 기본적으로 오름차순으로 정렬 시작
    }
  };

  return {
    fnSetSortingColumn,
    sortedData,
  };
};
