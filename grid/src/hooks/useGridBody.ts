import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type TransitionEvent,
} from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useColumnSort } from "./useColumnSort";
import { useGridStore } from "../store/gridStore";
import type { RowData } from "../types/types";

const ROW_HEIGHT = 40;
const ANIMATION_DURATION = 320;
const ANIMATION_EASING = "cubic-bezier(0.22, 1, 0.36, 1)";
const EXIT_BUFFER_MS = ANIMATION_DURATION + 40;

type MoveDirection = "up" | "down";

export type ExitRow = {
  key: string;
  id: string;
  y: number;
  targetY: number;
  direction: MoveDirection;
  size: number;
  data: RowData;
  run: number;
  active: boolean;
};

type VisibleRowSnapshot = {
  id: string;
  newY: number;
  size: number;
  data: RowData;
};

type VisibleGridRow = {
  key: string;
  rowData: RowData;
  size: number;
  start: number;
  registerRef: (el: HTMLDivElement | null) => void;
};

export const useGridBody = () => {
  "use no memo";

  const { sortedData } = useColumnSort();
  const parentRef = useRef<HTMLDivElement>(null);
  const setScrollLeft = useGridStore((s) => s.setScrollLeft);
  const sortingColumn = useGridStore((s) => s.sortingColumn);
  const sortDirection = useGridStore((s) => s.sortDirection);
  const [exitRows, setExitRows] = useState<ExitRow[]>([]);

  const sortKey = `${sortingColumn ?? "none"}-${sortDirection}`;

  const prevPositionsRef = useRef<Map<string, number>>(new Map());
  const prevRowsRef = useRef<Map<string, RowData>>(new Map());
  const prevSizesRef = useRef<Map<string, number>>(new Map());
  const prevOrderIndexRef = useRef<Map<string, number>>(new Map());
  const prevSortKeyRef = useRef<string | null>(null);
  const rowDivRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const enteringFromRef = useRef<Map<string, number>>(new Map());
  const exitTimerRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const exitAnimationFrameRef = useRef<number | null>(null);
  const transitionCleanupRef = useRef<Map<string, () => void>>(new Map());
  const animationRunRef = useRef(0);

  const anonymousIdMapRef = useRef<WeakMap<object, string>>(new WeakMap());
  const anonymousIdSeqRef = useRef(0);

  const getRowId = useCallback(
    (rowData: RowData | undefined, index: number) => {
      if (!rowData) {
        return `missing-row-${index}`;
      }

      const explicitId = rowData.id;
      if (
        explicitId !== undefined &&
        explicitId !== null &&
        explicitId !== ""
      ) {
        return String(explicitId);
      }

      const objectKey = rowData as unknown as object;
      const existingId = anonymousIdMapRef.current.get(objectKey);
      if (existingId) {
        return existingId;
      }

      const generatedId = `__anonymous-row-${anonymousIdSeqRef.current}`;
      anonymousIdSeqRef.current += 1;
      anonymousIdMapRef.current.set(objectKey, generatedId);
      return generatedId;
    },
    [],
  );

  const registerRowElement = useCallback(
    (rowId: string, element: HTMLDivElement | null) => {
      if (element) {
        rowDivRefs.current.set(rowId, element);
        return;
      }

      rowDivRefs.current.delete(rowId);
    },
    [],
  );

  const clearExitTimer = useCallback(() => {
    if (exitTimerRef.current !== null) {
      window.clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }
  }, []);

  const clearAnimationFrame = useCallback(() => {
    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (exitAnimationFrameRef.current !== null) {
      window.cancelAnimationFrame(exitAnimationFrameRef.current);
      exitAnimationFrameRef.current = null;
    }
  }, []);

  const clearTransitionListeners = useCallback(() => {
    transitionCleanupRef.current.forEach((cleanup) => cleanup());
    transitionCleanupRef.current.clear();
  }, []);

  const clearPendingAnimations = useCallback(() => {
    clearExitTimer();
    clearAnimationFrame();
    clearTransitionListeners();
  }, [clearAnimationFrame, clearExitTimer, clearTransitionListeners]);

  const buildOrderIndexMap = useCallback(
    (rows: RowData[]) => {
      const orderIndexMap = new Map<string, number>();
      rows.forEach((rowData, index) => {
        orderIndexMap.set(getRowId(rowData, index), index);
      });
      return orderIndexMap;
    },
    [getRowId],
  );

  const removeExitRowsByRun = useCallback((run: number) => {
    setExitRows((rows) => rows.filter((row) => row.run !== run));
  }, []);
  const rowVirtualizer = useVirtualizer({
    count: sortedData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
    getItemKey: (index) => getRowId(sortedData[index], index),
  });
  const virtualItems = rowVirtualizer.getVirtualItems();

  useEffect(() => {
    const container = parentRef.current;
    if (!container) return;

    const handleScroll = () => {
      setScrollLeft(container.scrollLeft);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [setScrollLeft]);

  useLayoutEffect(() => {
    const currentVisibleMap = new Map<string, VisibleRowSnapshot>();
    const currentPositions = new Map<string, number>();
    const currentRows = new Map<string, RowData>();
    const currentSizes = new Map<string, number>();

    virtualItems.forEach((virtualRow) => {
      const rowData = sortedData[virtualRow.index];
      if (!rowData) return;

      const rowId = getRowId(rowData, virtualRow.index);
      currentVisibleMap.set(rowId, {
        id: rowId,
        newY: virtualRow.start,
        size: virtualRow.size,
        data: rowData,
      });
      currentPositions.set(rowId, virtualRow.start);
      currentRows.set(rowId, rowData);
      currentSizes.set(rowId, virtualRow.size);
    });

    const isInitialRender = prevSortKeyRef.current === null;
    const isSortChanged =
      !isInitialRender && prevSortKeyRef.current !== sortKey;
    let nextOrderIndexSnapshot: Map<string, number> | null = null;

    if (isInitialRender) {
      nextOrderIndexSnapshot = buildOrderIndexMap(sortedData);
    }

    if (isSortChanged) {
      animationRunRef.current += 1;
      const currentRun = animationRunRef.current;

      clearPendingAnimations();
      setExitRows([]);
      enteringFromRef.current.clear();

      const prevOrderIndexMap = prevOrderIndexRef.current;
      const nextOrderIndexMap = buildOrderIndexMap(sortedData);
      nextOrderIndexSnapshot = nextOrderIndexMap;

      const scrollContainer = parentRef.current;
      const scrollTop = scrollContainer?.scrollTop ?? 0;
      const viewportHeight = scrollContainer?.clientHeight ?? 0;
      const viewportBottom = scrollTop + viewportHeight;
      const midLine = scrollTop + viewportHeight / 2;

      const resolveDeltaDirection = (
        prevIndex: number | undefined,
        nextIndex: number | undefined,
      ): MoveDirection | null => {
        if (prevIndex === undefined || nextIndex === undefined) {
          return null;
        }

        const delta = prevIndex - nextIndex;
        if (delta > 0) return "up";
        if (delta < 0) return "down";
        return null;
      };

      const resolveFallbackDirection = (y: number): MoveDirection => {
        if (viewportHeight > 0) {
          if (y <= scrollTop + ROW_HEIGHT) return "down";
          if (y + ROW_HEIGHT >= viewportBottom - ROW_HEIGHT) return "up";
          return y >= midLine ? "up" : "down";
        }

        if (sortDirection === "desc") return "up";
        if (sortDirection === "asc") return "down";
        return "up";
      };

      const resolveDirection = (
        prevIndex: number | undefined,
        nextIndex: number | undefined,
        y: number,
      ): MoveDirection => {
        const directionFromDelta = resolveDeltaDirection(prevIndex, nextIndex);
        if (directionFromDelta) {
          return directionFromDelta;
        }

        return resolveFallbackDirection(y);
      };

      const computeEntryY = (
        direction: MoveDirection,
        newY: number,
        size: number,
      ) => {
        if (sortDirection === "none") {
          const easedOffset = Math.min(size, 20);
          return direction === "up" ? newY + easedOffset : newY - easedOffset;
        }

        if (viewportHeight <= 0) {
          const fallbackOffset = Math.max(size, ROW_HEIGHT);
          return direction === "up"
            ? newY + fallbackOffset
            : newY - fallbackOffset;
        }

        return direction === "up" ? viewportBottom + size : scrollTop - size;
      };

      const computeExitTargetY = (
        direction: MoveDirection,
        oldY: number,
        size: number,
      ) => {
        if (sortDirection === "none") {
          const easedOffset = Math.min(size, 20);
          return direction === "up" ? oldY - easedOffset : oldY + easedOffset;
        }

        if (viewportHeight <= 0) {
          const fallbackOffset = Math.max(size, ROW_HEIGHT);
          return direction === "up"
            ? oldY - fallbackOffset
            : oldY + fallbackOffset;
        }

        const offscreenTop = scrollTop - (size + ROW_HEIGHT);
        const offscreenBottom = viewportBottom + size + ROW_HEIGHT;
        return direction === "up" ? offscreenTop : offscreenBottom;
      };

      const persistingRows: Array<{
        id: string;
        oldY: number;
        newY: number;
        direction: MoveDirection;
        el: HTMLDivElement;
      }> = [];
      const enteringRows: Array<{
        id: string;
        entryY: number;
        newY: number;
        direction: MoveDirection;
        el: HTMLDivElement;
      }> = [];

      currentVisibleMap.forEach((rowSnapshot, id) => {
        const el = rowDivRefs.current.get(id);
        if (!el) return;

        const prevIndex = prevOrderIndexMap.get(id);
        const nextIndex = nextOrderIndexMap.get(id);

        const oldY = prevPositionsRef.current.get(id);
        if (oldY !== undefined) {
          const direction = resolveDirection(
            prevIndex,
            nextIndex,
            rowSnapshot.newY,
          );
          persistingRows.push({
            id,
            oldY,
            newY: rowSnapshot.newY,
            direction,
            el,
          });
          return;
        }

        const direction = resolveDirection(
          prevIndex,
          nextIndex,
          rowSnapshot.newY,
        );
        const entryY = computeEntryY(
          direction,
          rowSnapshot.newY,
          rowSnapshot.size,
        );

        enteringFromRef.current.set(id, entryY);
        enteringRows.push({
          id,
          entryY,
          newY: rowSnapshot.newY,
          direction,
          el,
        });
      });

      const nextExitRows: ExitRow[] = [];
      prevPositionsRef.current.forEach((oldY, id) => {
        if (currentVisibleMap.has(id)) return;

        const oldRowData = prevRowsRef.current.get(id);
        if (!oldRowData) return;

        const size = prevSizesRef.current.get(id) ?? ROW_HEIGHT;
        const prevIndex = prevOrderIndexMap.get(id);
        const nextIndex = nextOrderIndexMap.get(id);
        const direction = resolveDirection(prevIndex, nextIndex, oldY);
        const targetY = computeExitTargetY(direction, oldY, size);

        nextExitRows.push({
          key: `${currentRun}-${id}`,
          id,
          y: oldY,
          targetY,
          direction,
          size,
          data: oldRowData,
          run: currentRun,
          active: false,
        });
      });

      const animatedRows = [...persistingRows, ...enteringRows];

      animatedRows.forEach((row) => {
        row.el.style.transition = "none";

        if ("oldY" in row) {
          row.el.style.transform = `translateY(${row.oldY}px)`;
          row.el.style.opacity = "";
          return;
        }

        row.el.style.transform = `translateY(${row.entryY}px)`;
        row.el.style.opacity = "0";
      });

      if (animatedRows.length > 0) {
        scrollContainer?.getBoundingClientRect();
      }

      animationFrameRef.current = window.requestAnimationFrame(() => {
        if (animationRunRef.current !== currentRun) {
          animationFrameRef.current = null;
          return;
        }

        setExitRows(nextExitRows);
        if (nextExitRows.length > 0) {
          exitAnimationFrameRef.current = window.requestAnimationFrame(() => {
            if (animationRunRef.current !== currentRun) {
              exitAnimationFrameRef.current = null;
              return;
            }

            setExitRows((rows) =>
              rows.map((row) =>
                row.run === currentRun ? { ...row, active: true } : row,
              ),
            );
            exitAnimationFrameRef.current = null;
          });

          exitTimerRef.current = window.setTimeout(() => {
            if (animationRunRef.current !== currentRun) return;
            removeExitRowsByRun(currentRun);
          }, EXIT_BUFFER_MS);
        }

        animatedRows.forEach((row) => {
          transitionCleanupRef.current.get(row.id)?.();

          row.el.style.transition = `transform ${ANIMATION_DURATION}ms ${ANIMATION_EASING}, opacity ${ANIMATION_DURATION}ms ${ANIMATION_EASING}`;
          row.el.style.transform = `translateY(${row.newY}px)`;

          const isEntering = "entryY" in row;
          if (isEntering) {
            row.el.style.opacity = "1";
          }

          const onTransitionEnd = (event: globalThis.TransitionEvent) => {
            if (event.target !== row.el) return;
            if (event.propertyName !== "transform") return;

            const cleanup = transitionCleanupRef.current.get(row.id);
            cleanup?.();

            row.el.style.transition = "";
            if (isEntering) {
              row.el.style.opacity = "";
            }
          };

          const cleanup = () => {
            row.el.removeEventListener("transitionend", onTransitionEnd);
            transitionCleanupRef.current.delete(row.id);
          };

          transitionCleanupRef.current.set(row.id, cleanup);
          row.el.addEventListener("transitionend", onTransitionEnd);
        });

        animationFrameRef.current = null;
      });
    }

    if (nextOrderIndexSnapshot) {
      prevOrderIndexRef.current = nextOrderIndexSnapshot;
    } else if (prevOrderIndexRef.current.size === 0) {
      prevOrderIndexRef.current = buildOrderIndexMap(sortedData);
    }

    prevPositionsRef.current = currentPositions;
    prevRowsRef.current = currentRows;
    prevSizesRef.current = currentSizes;
    prevSortKeyRef.current = sortKey;
  }, [
    virtualItems,
    sortKey,
    sortedData,
    getRowId,
    buildOrderIndexMap,
    clearPendingAnimations,
    sortDirection,
    removeExitRowsByRun,
  ]);

  useEffect(() => {
    return () => {
      clearPendingAnimations();
    };
  }, [clearPendingAnimations]);

  const handleExitTransitionEnd = useCallback(
    (event: TransitionEvent<HTMLDivElement>, exitRow: ExitRow) => {
      if (event.target !== event.currentTarget) return;
      if (event.propertyName !== "transform") return;
      if (animationRunRef.current !== exitRow.run) return;

      setExitRows((rows) => rows.filter((row) => row.key !== exitRow.key));
    },
    [],
  );

  const visibleRows = useMemo<VisibleGridRow[]>(() => {
    return virtualItems
      .map((virtualRow) => {
        const rowData = sortedData[virtualRow.index];
        if (!rowData) return null;

        const rowId = getRowId(rowData, virtualRow.index);
        return {
          key: rowId,
          rowData,
          size: virtualRow.size,
          start: virtualRow.start,
          registerRef: (element: HTMLDivElement | null) =>
            registerRowElement(rowId, element),
        };
      })
      .filter((row): row is VisibleGridRow => row !== null);
  }, [virtualItems, sortedData, getRowId, registerRowElement]);

  return {
    parentRef,
    totalSize: rowVirtualizer.getTotalSize(),
    visibleRows,
    exitRows,
    handleExitTransitionEnd,
  };
};
