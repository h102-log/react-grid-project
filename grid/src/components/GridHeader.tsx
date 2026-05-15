import { useGridStore } from "../store/gridStore";
import { useColumnSort } from "../hooks/useColumnSort";
import { useColumnOrder } from "../hooks/useColumnOrder";

const GridHeader: React.FC = () => {
  const columns = useGridStore((state) => state.columns);
  const sortingColumn = useGridStore((state) => state.sortingColumn);
  const sortDirection = useGridStore((state) => state.sortDirection);
  const scrollLeft = useGridStore((state) => state.scrollLeft);

  const { fnSetSortingColumn } = useColumnSort();
  const { mouseDown } = useColumnOrder(columns);
  const dragColumn = useGridStore((state) => state.dragColumn);

  return (
    <div className="grid-header">
      {[...columns]
        .sort((a, b) => a.key.localeCompare(b.key))
        .map((col) => {
          // 논리적으로 가장 마지막 위치(배열의 맨 끝)인지 판별
          const isLastColumn = columns[columns.length - 1].key === col.key;

          return (
            <div
              key={col.key}
              data-column-key={col.key}
              className={`grid-header-cell ${isLastColumn ? "last-column" : ""}`}
              // 체크박스가 아닐 때만 정렬 함수를 호출하도록 변경
              onClick={() => {
                if (col.key !== "_checkbox") {
                  fnSetSortingColumn(col.key);
                }
              }}
              onMouseDown={(e) => mouseDown(e, col.key)}
              style={{
                position: "absolute",
                left: `${(col.left ?? 0) - scrollLeft}px`,
                width: `${col.width}px`,
                // 드래그 중인 컬럼이 다른 컬럼 위로 지나갈 때를 대비해 z-index 조절
                zIndex: dragColumn === col.key ? 10 : 1,
                /*transition: "left 0.2s ease-in-out",*/
              }}
            >
              {/* 체크박스일 때는 div로 대체하고 정렬 아이콘을 숨김 */}
              {col.key === "_checkbox" ? (
                <div
                  className="checkbox-placeholder"
                  data-checked={false}
                ></div>
              ) : (
                <>
                  {col.name}
                  {sortingColumn === col.key && (
                    <span>
                      {sortDirection === "asc"
                        ? "▲"
                        : sortDirection === "desc"
                          ? "▼"
                          : ""}
                    </span>
                  )}
                </>
              )}
            </div>
          );
        })}
    </div>
  );
};

export default GridHeader;
