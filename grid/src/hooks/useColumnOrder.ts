import { useGridStore } from "../store/gridStore";
export const useColumnOrder = () => {
  const {
    setIsDraggingColumn,
    isDraggingColumn,
    setColumns,
    setDragPosition,
    columns,
  } = useGridStore();

  // 마우스 무브 시 드래그 중인 컬럼이 있다면 위치 업데이트
  const fnSetDraggingColumn = (
    e: React.MouseEvent<HTMLDivElement>,
    columnKey: string,
  ) => {
    e.preventDefault();
    setIsDraggingColumn(columnKey);
    setDragPosition({ x: e.clientX, y: e.clientY }); // 시작 좌표
  };

  const fnUpdateColumnOrder = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingColumn) return;

    setDragPosition({ x: e.clientX, y: e.clientY }); // 이동 중 좌표

    // 기존 컬럼 reorder 로직 유지
    const target = document.elementFromPoint(
      e.clientX,
      e.clientY,
    ) as HTMLElement;
    const targetKey = target
      ?.closest("[data-column-key]")
      ?.getAttribute("data-column-key");
    if (!targetKey || targetKey === isDraggingColumn) return;

    const currentColumns = columns;
    const fromIndex = currentColumns.findIndex(
      (col) => col.key === isDraggingColumn,
    );
    const toIndex = currentColumns.findIndex((col) => col.key === targetKey);
    if (fromIndex === -1 || toIndex === -1) return;

    const newColumns = [...currentColumns];
    const [moved] = newColumns.splice(fromIndex, 1);
    newColumns.splice(toIndex, 0, moved);
    setColumns(newColumns);
  };

  const fnEndDraggingColumn = () => {
    if (!isDraggingColumn) return;
    setIsDraggingColumn("");
    setDragPosition({ x: 0, y: 0 }); // 초기화
  };

  return {
    fnSetDraggingColumn,
    fnUpdateColumnOrder,
    fnEndDraggingColumn,
  };
};

export default useColumnOrder;
