import React, { useEffect, useState, useRef } from "react";
import type { GridProps } from "./types/types";
import GridContainer from "./components/GridContainer";
import GridHeader from "./components/GridHeader";
import GridBody from "./components/GridBody";
import HeaderDragModal from "./components/HeaderDragModal";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./styles/grid.css";
import { useGridStore } from "./store/gridStore";

const HGrid: React.FC<GridProps> = ({ columns, data }: GridProps) => {
  const [queryClient] = useState(() => new QueryClient());
  const setColumns = useGridStore((state) => state.setColumns);
  const setData = useGridStore((state) => state.setData);

  // 1. 그리드 전체 너비를 측정하기 위한 ref와 상태값 추가
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  // 2. 컨테이너의 실제 너비를 감지하여 업데이트합니다.
  useEffect(() => {
    if (!gridContainerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      // 측정된 컨테이너의 너비값 저장
      setContainerWidth(entries[0].contentRect.width);
    });

    observer.observe(gridContainerRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  const currentStoreColumns = useGridStore((state) => state.columns);

  // 3. 측정된 containerWidth를 바탕으로 컬럼 너비와 left를 계산합니다.
  useEffect(() => {
    // 너비 측정이 아직 안 끝났다면 계산을 잠시 보류합니다.
    if (containerWidth === 0) return;

    // 💡 순서 재정렬 상태를 유지하기 위해, 스토어에 이미 데이터가 있다면 그 순서를 사용합니다.
    // (단, 외부에서 주입되는 columns prop의 개수가 달라졌다면 초기화가 필요하므로 예외 처리)
    const baseColumns =
      currentStoreColumns.length === columns.length
        ? currentStoreColumns
        : columns;

    let definedWidthSum = 0; // width가 지정된 컬럼들의 너비 합
    let undefinedWidthCount = 0; // width가 지정되지 않은 컬럼들의 개수

    // 먼저 지정된 너비의 합과 지정되지 않은 컬럼의 개수를 구합니다.
    baseColumns.forEach((col) => {
      if (col.width !== undefined) {
        definedWidthSum += col.width;
      } else {
        undefinedWidthCount += 1;
      }
    });

    // 전체 너비에서 지정된 너비들을 빼서 '남은 공간'을 구합니다. (음수 방지를 위해 최소 0으로 처리)
    const remainingWidth = Math.max(0, containerWidth - definedWidthSum);

    // width가 없는 컬럼이 나눠 가질 n등분 너비를 구합니다. (0으로 나누는 것 방지)
    const autoWidth =
      undefinedWidthCount > 0 ? remainingWidth / undefinedWidthCount : 0;

    let currentLeft = 0;

    const columnsWithLeft = baseColumns.map((col) => {
      // width가 지정되어 있으면 그 값을, 없으면 n등분한 autoWidth를 사용합니다.
      const columnWidth = col.width !== undefined ? col.width : autoWidth;

      const updatedColumn = {
        ...col,
        width: columnWidth,
        left: currentLeft,
      };

      currentLeft += columnWidth;

      return updatedColumn;
    });

    setColumns(columnsWithLeft);
    if (Array.isArray(data)) {
      setData(data);
    }
  }, [
    columns,
    data,
    setColumns,
    setData,
    containerWidth,
    currentStoreColumns.length,
  ]); // currentStoreColumns.length를 추가하여 개수 변화 감지

  return (
    <QueryClientProvider client={queryClient}>
      {/* 측정할 수 있도록 ref를 연결해 줍니다. GridContainer가 div를 반환한다고 가정했습니다. */}
      <div ref={gridContainerRef} style={{ width: "100%", height: "100%" }}>
        <GridContainer>
          <GridHeader />
          <GridBody />
        </GridContainer>
        <HeaderDragModal containerRef={gridContainerRef} />
      </div>
    </QueryClientProvider>
  );
};

export default HGrid;
