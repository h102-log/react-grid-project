import type { JsonValue } from "../types/types";
interface GridCellProps {
  value: JsonValue;
}

const GridCell: React.FC<GridCellProps> = ({ value }) => {
  return <div className="grid-cell">{value}</div>;
};

export default GridCell;
