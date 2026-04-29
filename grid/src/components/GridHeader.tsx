import { useGridStore } from "../store/gridStore";

const GridHeader: React.FC = () => {
  const columns = useGridStore((state) => state.columns); // 컬럼 정보 가져오기
  const sortingColumn = useGridStore((state) => state.sortingColumn); // 현재 정렬 중인 컬럼 키 가져오기
  const setSortingColumn = useGridStore((state) => state.setSortingColumn); // 정렬 중인 컬럼 업데이트 함수 가져오기
  const sortDirection = useGridStore((state) => state.sortDirection); // 현재 정렬 방향 가져오기
  const setSortDirection = useGridStore((state) => state.setSortDirection); // 정렬 방향 업데이트 함수 가져오기

  return (
    <div className="grid-header">
      {columns.map((col) => (
        <div
          key={col.key}
          className="grid-header-cell"
          onClick={() => {
            setSortingColumn(col.key);
            if (sortingColumn === col.key) {
              setSortDirection(
                sortDirection === "asc"
                  ? "desc"
                  : sortDirection === "desc"
                    ? "none"
                    : "asc",
              );
            } else {
              setSortDirection("asc"); // 새로운 컬럼 클릭 시 기본 정렬 방향은 오름차순
            }
          }}
        >
          {/* 2. div 태그를 닫는 괄호(>) 추가 */}
          {col.name}
          {/* 정렬 아이콘 등 추가 가능 */}
          {sortingColumn === col.key && (
            // 정렬 아이콘 표시 (예: ▲ 또는 ▼)
            <span>
              {sortDirection === "asc"
                ? "▲"
                : sortDirection === "desc"
                  ? "▼"
                  : ""}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export default GridHeader;
