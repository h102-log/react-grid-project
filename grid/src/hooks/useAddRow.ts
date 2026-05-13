// 행 추가 기능을 위한 커스텀 훅
import { useCallback } from "react";
import { useGridStore } from "../store/gridStore";
import type { RowData } from "../types/types";
const useAddRow = () => {
  const setData = useGridStore((state) => state.setData);
  const data = useGridStore((state) => state.data);
  const columns = useGridStore((state) => state.columns);
  const addRow = useCallback(
    (item: RowData, index?: number) => {
      //item의 key가 data에 존재하지 않으면 빈값으로 초기화
      const newData = { ...item };
      columns.forEach((col) => {
        if (!(col.key in newData)) {
          newData[col.key] = ""; // key가 존재하지 않으면 빈 문자열로 초기화
        }
      });
      const insertIndex = index !== undefined ? index : data.length; // index가 명시되지 않으면 맨 뒤에 추가
      const updatedData = [...data];
      updatedData.splice(insertIndex, 0, newData); // index 위치에 newData를 삽입
      setData(updatedData);
    },
    [data, setData, columns],
  );
  return { addRow };
};
export default useAddRow;
