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
    getItemKey: (index) => String(sortedData[index]?.id ?? index),
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
        {rowVirtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.key}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
              transition: "transform 260ms cubic-bezier(0.22, 1, 0.36, 1)",
              willChange: "transform",
            }}
          >
            <GridRow rowData={sortedData[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default GridBody;
