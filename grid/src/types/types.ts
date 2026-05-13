// types.ts
// 그리드 컴포넌트에서 사용할 타입 정의

// 컬럼 정의 인터페이스
export interface Column {
  // 필수 값
  key: string; //컬럼의 고유 키
  name: string; //컬럼의 표시 이름

  // 선택사항
  width?: number; //컬럼의 너비 (선택 사항)
  left?: number; //컬럼의 왼쪽 위치 (선택 사항)
  readOnly?: boolean; //컬럼이 읽기 전용인지 여부 (선택 사항)
  cellRenderer?: (value: GridData, rowIndex: number) => React.ReactNode; //셀 렌더러 함수 (선택 사항)
  sortable?: boolean; //컬럼이 정렬 가능한지 여부 (선택 사항)
  resizable?: boolean; //컬럼이 크기 조절 가능한지 여부 (선택 사항)
  minWidth?: number; //컬럼의 최소 너비 (선택 사항)
  maxWidth?: number; //컬럼의 최대 너비 (선택 사항)
  filterable?: boolean; //컬럼이 필터링 가능한지 여부 (선택 사항)
  exportable?: boolean; //컬럼이 내보내기 가능한지 여부 (선택 사항)
  align?: "left" | "center" | "right"; //컬럼의 텍스트 정렬 방식 (선택 사항)
  hidden?: boolean; //컬럼이 숨겨져 있는지 여부 (선택 사항)
  headerRenderer?: (column: Column) => React.ReactNode; //헤더 렌더러 함수 (선택 사항)
}

// JSON 값 타입 유니언 (string, number, boolean, null, 배열, 객체)
export type JsonValue = string | number | boolean | Date | null;

export type RowData = Record<string, JsonValue>;

// 그리드 데이터 타입
export type GridData =
  | RowData[]
  | ((startIndex: number, endIndex: number) => Promise<RowData[]>);

// 기존 고급 그리드용 props
export interface GridProps<T = Record<string, JsonValue>> {
  columns: Column[];
  data: GridData;
  totalCount?: number;
  // --- AI 연동 옵션  ---
  apiKey?: string | ((query: string, contextData: T[]) => Promise<string>); // 상용 배포용 커스텀 콜백 함수
}
