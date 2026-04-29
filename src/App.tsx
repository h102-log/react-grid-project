import "./App.css";
import HGrid from "../grid/src/HGrid";
import { columns, getLargeDataSlice } from "./sampleData";

function App() {
  return (
    <>
      {/* 대용량 데이터로 Grid 호출 */}
      <HGrid columns={columns} data={getLargeDataSlice} />
    </>
  );
}

export default App;
