import { useEffect, useRef } from "react";
import { useGridStore } from "../store/gridStore";
import type { Column } from "../types/types";

// 마우스 드래그로 열 순서를 변경할 때, 열의 순서를 관리하는 훅입니다.
const useColumnOrder = (columns: Column[]) => {
  const { setDragPointer, setDragColumn, setColumns } = useGridStore();
  const autoScrollRafRef = useRef(0);
  const autoScrollVelocityRef = useRef(0);

  const columnsRef = useRef(columns);
  useEffect(() => {
    columnsRef.current = columns;
  }, [columns]);
  const rafRef = useRef(0);

  // 마우스 다운 이벤트 핸들러: 드래그 시작 시 호출됩니다.
  const mouseDown = (e: React.MouseEvent, columnKey: string) => {
    if (columnKey) {
      setDragColumn(columnKey);
      setDragPointer({ x: e.clientX, y: e.clientY });

      // 드래그가 시작된 그리드 헤더 영역의 위치를 기억합니다.
      const headerContainer = (e.currentTarget as HTMLElement).closest(
        ".grid-header",
      );
      if (!headerContainer) return;
      const gridContainer = headerContainer.closest(".grid-container");
      const bodyEl = gridContainer?.querySelector(
        ".grid-body",
      ) as HTMLDivElement | null;
      if (!bodyEl) return;
      const headerRect = headerContainer.getBoundingClientRect();
      const calcVelocity = (clientX: number) => {
        const rect = bodyEl.getBoundingClientRect();
        const EDGE = 56; // 가장자리 감지 폭(px)
        const MAX_SPEED = 22; // 프레임당 최대 스크롤(px)
        // 왼쪽 바깥/근접
        if (clientX < rect.left + EDGE) {
          const ratio = (rect.left + EDGE - clientX) / EDGE;
          return -Math.min(MAX_SPEED, Math.max(0, ratio * MAX_SPEED));
        }

        // 오른쪽 바깥/근접
        if (clientX > rect.right - EDGE) {
          const ratio = (clientX - (rect.right - EDGE)) / EDGE;
          return Math.min(MAX_SPEED, Math.max(0, ratio * MAX_SPEED));
        }

        return 0;
      };

      const startAutoScrollLoop = () => {
        if (autoScrollRafRef.current) return;

        const tick = () => {
          const v = autoScrollVelocityRef.current;
          if (v !== 0) {
            const maxLeft = bodyEl.scrollWidth - bodyEl.clientWidth;
            const nextLeft = Math.max(
              0,
              Math.min(maxLeft, bodyEl.scrollLeft + v),
            );

            if (nextLeft !== bodyEl.scrollLeft) {
              bodyEl.scrollLeft = nextLeft;
              useGridStore.getState().setScrollLeft(nextLeft);
            }
          }

          if (autoScrollVelocityRef.current !== 0) {
            autoScrollRafRef.current = requestAnimationFrame(tick);
          } else {
            autoScrollRafRef.current = 0;
          }
        };

        autoScrollRafRef.current = requestAnimationFrame(tick);
      };

      const stopAutoScrollLoop = () => {
        autoScrollVelocityRef.current = 0;
        if (autoScrollRafRef.current) {
          cancelAnimationFrame(autoScrollRafRef.current);
          autoScrollRafRef.current = 0;
        }
      };
      const mouseMove = (moveEvent: MouseEvent) => {
        // 드래그 중인 마우스 좌표 업데이트 (rAF 밖에서 즉시 반영 → 모달 추적 부드럽게)
        setDragPointer({ x: moveEvent.clientX, y: moveEvent.clientY });
        autoScrollVelocityRef.current = calcVelocity(moveEvent.clientX);
        if (autoScrollVelocityRef.current !== 0) startAutoScrollLoop();
        // 컬럼 순서 계산은 rAF로 throttle → 60fps 제한
        cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
          const currentColumns = columnsRef.current;
          const dragIndex = currentColumns.findIndex(
            (col) => col.key === columnKey,
          );
          if (dragIndex === -1) return;

          // 마우스 X 좌표를 그리드 헤더 내부의 상대 X 좌표로 계산합니다.
          const offsetX =
            moveEvent.clientX - headerRect.left + bodyEl.scrollLeft;

          let targetIndex = dragIndex;

          // 💡 렌더링 된 DOM(elementFromPoint) 대신 상태 데이터(left, width)를 기준으로 판단하여 Jitter(떨림/버벅임) 현상을 완벽히 차단합니다.
          for (let i = 0; i < currentColumns.length; i++) {
            if (i === dragIndex) continue;

            const col = currentColumns[i];
            const colLeft = col.left || 0;
            const colWidth = col.width || 0;

            if (dragIndex < i && offsetX >= colLeft) {
              // 오른쪽으로 드래그할 때: 마우스가 대상 대상 컬럼의 **왼쪽 경계(들어가기 시작하는 영역)**를 넘어가면 타겟으로 삼음
              targetIndex = i;
            } else if (dragIndex > i && offsetX <= colLeft + colWidth) {
              // 왼쪽으로 드래그할 때: 마우스가 대상 대상 컬럼의 **오른쪽 경계(들어가기 시작하는 영역)**를 지나서 타겟으로 삼음
              targetIndex = i;
              break; // 배열의 앞쪽부터 탐색하므로 닿는 순간 멈춤
            }
          }

          if (targetIndex !== dragIndex) {
            const newColumns = [...currentColumns];

            // 1:1 교체(Swap)가 아닌, 해당 위치로 삽입하고 나머지를 밀어냅니다
            const [draggedItem] = newColumns.splice(dragIndex, 1);
            newColumns.splice(targetIndex, 0, draggedItem);

            // 💡 애니메이션을 위해 left 좌표를 새 순서에 맞게 재계산합니다.
            let currentLeft = 0;
            const recalculatedColumns = newColumns.map((col) => {
              const updatedCol = { ...col, left: currentLeft };
              currentLeft += col.width || 0;
              return updatedCol;
            });

            // 상태를 업데이트하면 HGrid에서 left 값을 즉시 재계산합니다.
            setColumns(recalculatedColumns);
          }
        }); // rAF 닫기
      };

      const mouseUp = () => {
        // 드래그 종료 시 상태 초기화
        cancelAnimationFrame(rafRef.current);
        stopAutoScrollLoop();
        setDragColumn("");
        setDragPointer(null);
        document.removeEventListener("mousemove", mouseMove);
        document.removeEventListener("mouseup", mouseUp);
      };

      document.addEventListener("mousemove", mouseMove);
      document.addEventListener("mouseup", mouseUp);
    }
  };

  return { mouseDown };
};

export { useColumnOrder };
