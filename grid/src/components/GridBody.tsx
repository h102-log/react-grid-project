import React from "react";
import GridRow from "./GridRow";
import { useColumnSort } from "../hooks/useColumnSort";

const GridBody: React.FC = () => {
  const { sortedData } = useColumnSort();

  return (
    <div className="grid-body">
      {sortedData.map((val, rowIndex) => (
        <GridRow key={rowIndex} rowData={val} />
      ))}
    </div>
  );
};

export default GridBody;
