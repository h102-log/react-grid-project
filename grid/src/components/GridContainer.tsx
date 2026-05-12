import { useColumnOrder } from "../hooks/useColumnOrder";
const GridContainer: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { fnUpdateColumnOrder, fnEndDraggingColumn } = useColumnOrder(); // 컬럼 순서 관련 함수 가져오기
  return (
    <div
      className="grid-container"
      onMouseMove={(e) => fnUpdateColumnOrder(e)}
      onMouseUp={(e) => fnEndDraggingColumn()}
    >
      {children}
    </div>
  );
};

export default GridContainer;
