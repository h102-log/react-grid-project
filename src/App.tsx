import "./App.css";
import HGrid from "../grid/src/HGrid";
import { columns, rows } from "./sampleData";
// src/App.tsx
function App() {
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
          boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
          borderRadius: "6px",
          overflow: "hidden",
        }}
      >
        <HGrid columns={columns} data={rows} />
      </div>
    </div>
  );
}

export default App;
