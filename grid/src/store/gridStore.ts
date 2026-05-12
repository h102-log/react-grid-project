// store/gridStore.ts
import { create } from "zustand";
import type { Column, RowData } from "../types/types";

interface GridState {
  columns: Column[];
  columnOrder: string[]; // 컬럼 순서를 저장할 상태 추가
  data: RowData[];
  sortingColumn: string | null; // 정렬 중인 컬럼 키를 저장할 상태 추가
  sortDirection: "asc" | "desc" | "none"; // 정렬 방향을 저장할 상태 추가
  setColumns: (cols: Column[]) => void; // 컬럼 업데이트 함수
  setColumnOrder: (order: string[]) => void; // 컬럼 순서 업데이트 함수
  setData: (data: RowData[]) => void; // 행 데이터 업데이트 함수
  setSortingColumn: (colKey: string | null) => void; // 정렬 중인 컬럼 업데이트 함수
  setSortDirection: (direction: "asc" | "desc" | "none") => void; // 정렬 방향 업데이트 함수
  setIsDragging: (isDragging: boolean) => void; // 드래그 상태 업데이트 함수
  isDragging: boolean; // 드래그 상태를 저장할 상태 추가
  setIsDraggingColumn: (isDraggingColumn: string) => void; // 컬럼 드래그 상태 업데이트 함수
  isDraggingColumn: string; // 컬럼 드래그 상태를 저장할 상태 추가
  dragPosition: { x: number; y: number }; // 드래그 위치를 저장할 상태 추가
  setDragPosition: (position: { x: number; y: number }) => void; // 드래그 위치 업데이트 함수
  draggingColumn: string; // 현재 드래그 중인 컬럼 키를 저장할 상태 추가
  dragOverColumn: string; // 현재 드래그 오버 중인 컬럼 키를 저장할 상태 추가
  dragStartX: number; // 드래그 시작 시 마우스 X 좌표를 저장할 상태 추가
  dragPointer: { x: number; y: number }; // 드래그 중 마우스 포인터 위치를 저장할 상태 추가
  dragBounds: {
    left: number;
    top: number;
    right: number;
    bottom: number;
  } | null; // 드래그 가능한 영역의 경계를 저장할 상태 추가
  setDraggingColumn: (columnKey: string) => void;
  setDragOverColumn: (columnKey: string) => void;
  setDragStartX: (x: number) => void;
  setDragPointer: (position: { x: number; y: number }) => void;
  setDragBounds: (
    bounds: {
      left: number;
      top: number;
      right: number;
      bottom: number;
    } | null,
  ) => void;
}

export const useGridStore = create<GridState>((set) => ({
  columns: [],
  columnOrder: [],
  data: [],
  sortingColumn: null, // 정렬 상태 초기값 설정
  sortDirection: "none", // 정렬 방향 초기값 설정
  setColumns: (columns) => set({ columns }),
  setColumnOrder: (order) => set({ columnOrder: order }),
  setData: (data) => set({ data }),
  setSortingColumn: (colKey) => set({ sortingColumn: colKey }), // 매개변수 colKey를 받아 상태 업데이트
  setSortDirection: (direction) => set({ sortDirection: direction }), // 매개변수 direction을 받아 상태 업데이트
  isDragging: false, // 드래그 상태 초기값 설정
  setIsDragging: (isDragging) => set({ isDragging }), // 매개변수 isDragging을 받아 상태 업데이트
  isDraggingColumn: "", // 컬럼 드래그 상태 초기값 설정
  setIsDraggingColumn: (isDraggingColumn) => set({ isDraggingColumn }), // 매개변수 isDraggingColumn을 받아 상태 업데이트
  dragPosition: { x: 0, y: 0 }, // 드래그 위치 초기값 설정
  setDragPosition: (position) => set({ dragPosition: position }), // 매개변수 position을 받아 상태 업데이트
  draggingColumn: "", // 현재 드래그 중인 컬럼 키 초기값 설정
  dragOverColumn: "", // 현재 드래그 오버 중인 컬럼 키 초기값 설정
  dragStartX: 0, // 드래그 시작 시 마우스 X 좌표 초기값 설정
  dragPointer: { x: 0, y: 0 }, // 드래그 중 마우스 포인터 위치 초기값 설정
  dragBounds: null, // 드래그 가능한 영역의 경계 초기값 설정
  setDraggingColumn: (columnKey) => set({ draggingColumn: columnKey }), // 매개변수 columnKey를 받아 상태 업데이트
  setDragOverColumn: (columnKey) => set({ dragOverColumn: columnKey }), // 매개변수 columnKey를 받아 상태 업데이트
  setDragStartX: (x) => set({ dragStartX: x }), // 매개변수 x를 받아 상태 업데이트
  setDragPointer: (position) => set({ dragPointer: position }), // 매개변수 position을 받아 상태 업데이트
  setDragBounds: (bounds) => set({ dragBounds: bounds }), // 매개변수 bounds를 받아 상태 업데이트
}));
