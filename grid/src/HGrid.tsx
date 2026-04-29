import React from "react";
import type { GridProps } from "./types/types";
import GridContainer from "./components/GridContainer";
import GridHeader from "./components/GridHeader";
import GridBody from "./components/GridBody";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./styles/grid.css";
import { useEffect } from "react";
import { useGridStore } from "./store/gridStore";

const HGrid: React.FC<GridProps> = ({ columns, data }: GridProps) => {
  // React Query 클라이언트 생성
  const queryClient = new QueryClient();
  const setColumns = useGridStore((state) => state.setColumns);
  const setRows = useGridStore((state) => state.setRows);

  // 현재 정렬진행중인 컬럼

  useEffect(() => {
    setColumns(columns);
    if (Array.isArray(data)) {
      setRows(data);
    }
    // 비동기 데이터는 별도 관리 필요 (여기선 rows만)
  }, [columns, data, setColumns, setRows]);

  return (
    <QueryClientProvider client={queryClient}>
      <GridContainer>
        <GridHeader />
        <GridBody />
      </GridContainer>
    </QueryClientProvider>
  );
};

export default HGrid;
