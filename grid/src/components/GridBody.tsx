import GridRow from "./GridRow";
import { useGridBody } from "../hooks/useGridBody";

const GridBody = () => {
  const {
    parentRef,
    totalSize,
    visibleRows,
    exitRows,
    handleExitTransitionEnd,
  } = useGridBody();

  return (
    <div ref={parentRef} className="grid-body">
      <div
        style={{
          height: `${totalSize}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {visibleRows.map((row) => {
          return (
            <div
              key={row.key}
              ref={row.registerRef}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${row.size}px`,
                transform: `translateY(${row.start}px)`,
                willChange: "transform",
              }}
            >
              <GridRow rowData={row.rowData} />
            </div>
          );
        })}

        {exitRows.length > 0 && (
          <div className="grid-exit-overlay" aria-hidden="true">
            {exitRows.map((exitRow) => (
              <div
                key={exitRow.key}
                className={`grid-exit-row grid-exit-row-${exitRow.direction}`}
                style={{
                  height: `${exitRow.size}px`,
                  transform: `translateY(${exitRow.active ? exitRow.targetY : exitRow.y}px)`,
                  opacity: exitRow.active ? 0 : 1,
                }}
                onTransitionEnd={(event) =>
                  handleExitTransitionEnd(event, exitRow)
                }
              >
                <GridRow rowData={exitRow.data} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GridBody;
