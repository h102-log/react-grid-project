import React from "react";
import type { GridProps } from "./types/types";
import GridContainer from "./components/GridContainer";
import GridHeader from "./components/GridHeader";
import GridBody from "./components/GridBody";
import HeaderModal from "./components/HeaderModal";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./styles/grid.css";
import { useEffect } from "react";
import { useGridStore } from "./store/gridStore";

const HGrid: React.FC<GridProps> = ({ columns, data }: GridProps) => {
  // React Query 클라이언트 생성
  const queryClient = new QueryClient();
  const setColumns = useGridStore((state) => state.setColumns);
  const setData = useGridStore((state) => state.setData);

  // 현재 정렬진행중인 컬럼

  useEffect(() => {
    setColumns(columns);
    if (Array.isArray(data)) {
      setData(data);
    }
    // 비동기 데이터는 별도 관리 필요 (여기선 data만)
  }, [columns, data, setColumns, setData]);

  return (
    <QueryClientProvider client={queryClient}>
      <GridContainer>
        <GridHeader />
        <GridBody />
        <HeaderModal />
      </GridContainer>
    </QueryClientProvider>
  );
};

export default HGrid;
