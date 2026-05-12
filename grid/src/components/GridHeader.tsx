import { useGridStore } from "../store/gridStore";
import { useColumnSort } from "../hooks/useColumnSort";

const GridHeader: React.FC = () => {
  const columns = useGridStore((state) => state.columns); // 컬럼 정보 가져오기
  const sortingColumn = useGridStore((state) => state.sortingColumn); // 현재 정렬 중인 컬럼 키 가져오기
  const sortDirection = useGridStore((state) => state.sortDirection); // 현재 정렬 방향 가져오기
  const { fnSetSortingColumn } = useColumnSort(); // 정렬 관련 함수 가져오기

  return (
    <div className="grid-header">
      {columns.map((col) => (
        <div
          key={col.key}
          className="grid-header-cell"
          onClick={() => {
            fnSetSortingColumn(col.key); // 클릭한 컬럼을 정렬 중인 컬럼으로 설정
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
