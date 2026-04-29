// store/gridStore.ts
import { create } from "zustand";
import type { Column, RowData } from "../types/types";

interface GridState {
  columns: Column[];
  rows: RowData[];
  sortingColumn: string | null; // 정렬 중인 컬럼 키를 저장할 상태 추가
  sortDirection: "asc" | "desc" | "none"; // 정렬 방향을 저장할 상태 추가
  setColumns: (cols: Column[]) => void; // 컬럼 업데이트 함수
  setRows: (rows: RowData[]) => void; // 행 데이터 업데이트 함수
  setSortingColumn: (colKey: string | null) => void; // 정렬 중인 컬럼 업데이트 함수
  setSortDirection: (direction: "asc" | "desc" | "none") => void; // 정렬 방향 업데이트 함수
}

export const useGridStore = create<GridState>((set) => ({
  columns: [],
  rows: [],
  sortingColumn: null, // 정렬 상태 초기값 설정
  sortDirection: "none", // 정렬 방향 초기값 설정
  setColumns: (columns) => set({ columns }),
  setRows: (rows) => set({ rows }),
  setSortingColumn: (colKey) => set({ sortingColumn: colKey }), // 매개변수 colKey를 받아 상태 업데이트
  setSortDirection: (direction) => set({ sortDirection: direction }), // 매개변수 direction을 받아 상태 업데이트
}));
