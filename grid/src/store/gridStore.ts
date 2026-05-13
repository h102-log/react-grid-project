// store/gridStore.ts
import { create } from "zustand";
import type { Column, RowData } from "../types/types";

interface GridState {
  columns: Column[];
  data: RowData[];
  sortingColumn: string | null; // 정렬 중인 컬럼 키를 저장할 상태 추가
  sortDirection: "asc" | "desc" | "none"; // 정렬 방향을 저장할 상태 추가
  dragPointer: { x: number; y: number } | null; // 드래그 중인 포인터 위치 상태 추가
  dragColumn: string | null; // 현재 드래그 중인 컬럼 키 상태 추가
  scrollLeft: number; // 수평 스크롤 위치
  setColumns: (cols: Column[]) => void; // 컬럼 업데이트 함수
  setData: (data: RowData[]) => void; // 행 데이터 업데이트 함수
  setSortingColumn: (colKey: string | null) => void; // 정렬 중인 컬럼 업데이트 함수
  setSortDirection: (direction: "asc" | "desc" | "none") => void; // 정렬 방향 업데이트 함수
  setDragPointer: (pointer: { x: number; y: number } | null) => void; // 드래그 포인터 위치 업데이트 함수
  setDragColumn: (colKey: string | null) => void; // 드래그 중인 컬럼 키 업데이트 함수
  setScrollLeft: (x: number) => void; // 스크롤 위치 업데이트 함수
}

export const useGridStore = create<GridState>((set) => ({
  columns: [],
  data: [],
  sortingColumn: null, // 정렬 상태 초기값 설정
  sortDirection: "none", // 정렬 방향 초기값 설정
  dragPointer: null, // 드래그 포인터 초기값 설정
  dragColumn: null, // 드래그 중인 컬럼 초기값 설정
  scrollLeft: 0, // 스크롤 위치 초기값
  setColumns: (columns) => set({ columns }),
  setData: (data) => set({ data }),
  setSortingColumn: (colKey) => set({ sortingColumn: colKey }), // 매개변수 colKey를 받아 상태 업데이트
  setSortDirection: (direction) => set({ sortDirection: direction }), // 매개변수 direction을 받아 상태 업데이트
  setDragPointer: (pointer) => set({ dragPointer: pointer }), // 매개변수 pointer를 받아 상태 업데이트
  setDragColumn: (colKey) => set({ dragColumn: colKey }), // 매개변수 colKey를 받아 상태 업데이트
  setScrollLeft: (x) => set({ scrollLeft: x }), // 스크롤 위치 업데이트
}));
