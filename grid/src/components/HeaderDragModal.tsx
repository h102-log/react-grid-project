import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useGridStore } from "../store/gridStore";

interface HeaderDragModalProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
}

const clamp = (value: number, min: number, max: number) => {
  if (max < min) return min;
  return Math.min(Math.max(value, min), max);
};

const HeaderDragModal: React.FC<HeaderDragModalProps> = ({ containerRef }) => {
  const dragPointer = useGridStore((state) => state.dragPointer);
  const dragColumn = useGridStore((state) => state.dragColumn);
  const columns = useGridStore((state) => state.columns);

  const modalRef = useRef<HTMLDivElement>(null);
  const [modalSize, setModalSize] = useState({ width: 160, height: 52 });

  const activeColumn = useMemo(
    () => columns.find((col) => col.key === dragColumn),
    [columns, dragColumn],
  );

  useLayoutEffect(() => {
    if (!modalRef.current) return;

    const rect = modalRef.current.getBoundingClientRect();
    setModalSize((prev) => {
      if (prev.width === rect.width && prev.height === rect.height) {
        return prev;
      }
      return { width: rect.width, height: rect.height };
    });
  }, [activeColumn?.name, dragColumn]);

  if (!dragPointer || !dragColumn || !activeColumn) {
    return null;
  }

  const containerRect = containerRef.current?.getBoundingClientRect();
  const offset = 12;
  const edgeGap = 8;

  let nextLeft = dragPointer.x + offset;
  let nextTop = dragPointer.y + offset;

  if (containerRect) {
    const minLeft = containerRect.left + edgeGap;
    const maxLeft = containerRect.right - modalSize.width - edgeGap;
    const minTop = containerRect.top + edgeGap;
    const maxTop = containerRect.bottom - modalSize.height - edgeGap;

    nextLeft = clamp(nextLeft, minLeft, maxLeft);
    nextTop = clamp(nextTop, minTop, maxTop);
  }

  return (
    <div
      ref={modalRef}
      className="header-modal"
      style={{
        left: `${nextLeft}px`,
        top: `${nextTop}px`,
      }}
    >
      <div className="header-modal-title">{activeColumn.name}</div>
      <div className="header-modal-meta">컬럼 이동 중</div>
    </div>
  );
};

export default HeaderDragModal;
