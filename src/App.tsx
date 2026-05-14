import "./App.css";
import HGrid from "../grid/src/HGrid";
import useAddRow from "../grid/src/hooks/useAddRow";
import { columns, largeColumns, largeData } from "./sampleData";
import type { RowData } from "../grid/src/types/types";

const API_URL = "https://fakestoreapi.com/products";

const fetchFromServer = async (
  startIndex: number,
  endIndex: number,
): Promise<RowData[]> => {
  // GET 요청은 body를 사용할 수 없으므로 쿼리 파라미터로 전달합니다.
  const url = new URL(API_URL);
  url.searchParams.set("limit", String(endIndex - startIndex));
  url.searchParams.set("offset", String(startIndex));

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error(`서버 오류: ${response.status} ${response.statusText}`);
  }

  const json = await response.json();

  // 서버가 { data: [...] } 혹은 배열 자체를 반환하는 두 가지 케이스를 처리합니다.
  const rows: RowData[] = Array.isArray(json) ? json : (json.data ?? []);
  return rows;
};

// src/App.tsx
function App() {
  // 행 추가 훅 호출 (상태와 액션을 가져옴)
  const { addRow } = useAddRow();

  // 행 추가 버튼 클릭 이벤트 핸들러
  const handleAddRow = () => {
    // 추가할 임의의 새 데이터 (실제 columns 설정에 맞게 프로퍼티 수정 필요)
    const newRowData = {
      id: Date.now(), // 고유한 ID 생성
      name: "새로운 행",
      email: "new_row@example.com",
    };

    // 0번째 인덱스(맨 앞)에 새로운 행 데이터 삽입
    addRow(newRowData, 0);
  };

  return (
    <div
      className="App"
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
        padding: "40px",
        backgroundColor: "#f0f2f5",
      }}
    >
      <div
        style={{
          width: "900px",
          maxWidth: "100%",
          height: "600px",
          display: "flex", // 버튼 영역과 그리드 영역을 분리하기 위해 flex 사용
          flexDirection: "column",
          boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
          borderRadius: "6px",
          overflow: "hidden",
          backgroundColor: "#fff", // 배경색 추가
        }}
      >
        {/* 상단 툴바(버튼) 영역 */}
        <div
          style={{
            padding: "12px 16px",
            borderBottom: "1px solid #e0e0e0",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={handleAddRow}
            style={{
              padding: "8px 16px",
              backgroundColor: "#4F46E5",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: 600,
              transition: "background-color 0.2s",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "#4338CA")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "#4F46E5")
            }
          >
            + 행 추가
          </button>
        </div>

        {/* 그리드 렌더링 영역 */}
        <div style={{ flex: 1, overflow: "hidden" }}>
          <HGrid
            /*columns={largeColumns}*/
            columns={columns}
            data={largeData}
            onFetchData={fetchFromServer}
            /*onFetchData={fetchFromServer}*/
            startIndex={0}
            endIndex={1000}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
