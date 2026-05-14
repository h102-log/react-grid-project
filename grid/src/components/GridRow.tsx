import GridCell from "./GridCell";
import { useGridStore } from "../store/gridStore";
import type { RowData } from "../types/types";

interface GridRowProps {
  rowData: RowData;
}

const GridRow: React.FC<GridRowProps> = ({ rowData }) => {
  const columns = useGridStore((state) => state.columns);
  return (
    <div className="grid-row" style={{ position: "relative", height: "40px" }}>
      {" "}
      {[...columns]
        .sort((a, b) => a.key.localeCompare(b.key))
        .map((col) => {
          // 논리적으로 가장 마지막 위치(배열의 맨 끝)인지 판별
          const isLastColumn = columns[columns.length - 1].key === col.key;

          return (
            <GridCell
              key={col.key}
              columnKey={col.key}
              value={rowData[col.key]}
              left={col.left} // 추가된 부분
              width={col.width} // 추가된 부분
              isLastColumn={isLastColumn}
            />
          );
        })}
    </div>
  );
};

export default GridRow;
