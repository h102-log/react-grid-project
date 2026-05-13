// 행 삭제 기능을 위한 커스텀 훅
import { useCallback } from "react";
import { useGridStore } from "../store/gridStore";
const useDeleteRow = () => {
  const setData = useGridStore((state) => state.setData);
  const data = useGridStore((state) => state.data);
  const deleteRow = useCallback(
    (rowIndex: number) => {
      const updatedData = [...data];
      updatedData.splice(rowIndex, 1);
      setData(updatedData);
    },
    [data, setData],
  );
  return { deleteRow };
};
export default useDeleteRow;
