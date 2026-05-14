import React, { useRef, useEffect } from "react";
import GridRow from "./GridRow";
import { useColumnSort } from "../hooks/useColumnSort";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useGridStore } from "../store/gridStore";

const ROW_HEIGHT = 40;

const GridBody: React.FC = () => {
  const { sortedData } = useColumnSort();
  const parentRef = useRef<HTMLDivElement>(null);
  const { setScrollLeft } = useGridStore();

  const rowVirtualizer = useVirtualizer({
    count: sortedData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
  });

  useEffect(() => {
    const container = parentRef.current;
    if (!container) return;

    const handleScroll = () => {
      setScrollLeft(container.scrollLeft);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [setScrollLeft]);

  return (
    <div ref={parentRef} className="grid-body">
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          // 1. 현재 인덱스의 데이터 가져오기
          const rowData = sortedData[virtualRow.index];

          // 2. TypeScript 에러 해결: rowData.id가 존재하면 String()을 통해 안전하게 문자로 변환
          // (만약 데이터에 id라는 고유 식별자가 없다면 데이터가 가진 고유한 다른 필드명으로 교체하세요)
          const rowKey = rowData.id ? String(rowData.id) : virtualRow.index;

          return (
            <div
              key={rowKey}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
                // 3. Transform 기반 애니메이션 추가 (행 자체가 위아래로 부드럽게 이동)
                transition: "transform 0.4s cubic-bezier(0.1, 0.7, 0.1, 1)",
                willChange: "transform", // 애니메이션 성능 최적화
              }}
            >
              <GridRow rowData={rowData} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GridBody;
