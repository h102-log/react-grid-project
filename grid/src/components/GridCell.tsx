import type { JsonValue } from "../types/types";
interface GridCellProps {
  value: JsonValue;
  columnKey?: string; // 컬럼 키를 추가하여 드래그 시 식별 가능하도록 함
}

const GridCell: React.FC<GridCellProps> = ({
  value,
  columnKey: dataColumnKey,
}) => {
  const displayValue = typeof value === "object" && value !== null ? JSON.stringify(value) : String(value);
  
  return (
    <div className="grid-cell" data-column-key={dataColumnKey}>
      {displayValue}
    </div>
  );
};

export default GridCell;
