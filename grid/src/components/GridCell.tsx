import { useGridStore } from "../store/gridStore";
import type { JsonValue } from "../types/types";

interface GridCellProps {
  value: JsonValue;
  columnKey?: string; // 컬럼 키를 추가하여 드래그 시 식별 가능하도록 함
  left?: number; // 추가된 부분
  width?: number; // 추가된 부분
  isLastColumn?: boolean; // 마지막 컬럼 여부
}

const GridCell: React.FC<GridCellProps> = ({
  value,
  columnKey: dataColumnKey,
  left,
  width,
  isLastColumn,
}) => {
  const dragColumn = useGridStore((state) => state.dragColumn);

  const displayValue =
    typeof value === "object" && value !== null
      ? JSON.stringify(value)
      : String(value);

  return (
    <div
      className={`grid-cell ${isLastColumn ? "last-column" : ""}`}
      data-column-key={dataColumnKey}
      style={{
        position: "absolute",
        left: `${left}px`,
        width: `${width}px`,
        transition: "left 0.2s ease-in-out", // 헤더와 함께 부드럽게 움직이도록
      }}
    >
      {displayValue}
    </div>
  );
};

export default GridCell;
