import type { Column } from "../grid/src/types/types";
// 샘플 데이터 및 컬럼 정의
export const columns: Column[] = [
  { key: "id", name: "ID" },
  { key: "age", name: "나이" },
  { key: "name", name: "이름" },
];

export const rows = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  name: `사용자 ${i + 1}`,
  age: Math.floor(Math.random() * 60) + 20,
}));

// 대용량 데이터 예시
export const largeData = Array.from({ length: 10000 }, (_, i) => ({
  id: i + 1,
  name: `사용자 ${i + 1}`,
  age: Math.floor(Math.random() * 60) + 20,
}));

// largeData에서 startIndex, endIndex 범위의 데이터를 반환하는 콜백 함수
export const getLargeDataSlice = async (
  startIndex: number,
  endIndex: number,
) => {
  // endIndex는 포함하지 않는 범위로 가정 (slice와 동일)
  return largeData.slice(startIndex, endIndex);
};
