import GridCell from "./GridCell";
import { useGridStore } from "../store/gridStore";
import type { RowData } from "../types/types";

interface GridRowProps {
  rowData: RowData;
}

const GridRow: React.FC<GridRowProps> = ({ rowData }) => {
  const columns = useGridStore((state) => state.columns);
  return (
    <div className="grid-row">
      {columns.map((col, cellIndex) => (
        <GridCell key={col.key} value={rowData[col.key]} />
      ))}
    </div>
  );
};

export default GridRow;
