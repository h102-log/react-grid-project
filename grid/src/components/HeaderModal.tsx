//컬럼 드래그중 컬럼 드래그 상태를 관리하는 모달 컴포넌트
import React from "react";
import { useGridStore } from "../store/gridStore";
const HeaderModal: React.FC = () => {
  const isDraggingColumn = useGridStore((state) => state.isDraggingColumn);
  const dragPosition = useGridStore((state) => state.dragPosition);

  if (!isDraggingColumn) return null;

  return (
    <div
      className="header-modal"
      style={{
        left: dragPosition.x + 12,
        top: dragPosition.y + 12,
        transform: "none",
      }}
    >
      <p>{isDraggingColumn}</p>
    </div>
  );
};
export default HeaderModal;
