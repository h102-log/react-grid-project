import React from "react";
import GridRow from "./GridRow";
import { useGridStore } from "../store/gridStore";

const GridBody: React.FC = () => {
  const rows = useGridStore((state) => state.rows);
  return (
    <div className="grid-body">
      {rows.map((row, rowIndex) => (
        <GridRow key={rowIndex} rowData={row} />
      ))}
    </div>
  );
};

export default GridBody;
