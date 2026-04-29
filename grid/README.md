# my-grid-lib

React 범용 그리드 컴포넌트 라이브러리

## 사용법

```tsx
import { Grid } from "my-grid-lib";

const columns = [
  { key: "id", header: "ID" },
  { key: "name", header: "이름" },
  { key: "age", header: "나이" },
];
const rows = [
  { id: 1, name: "홍길동", age: 28 },
  { id: 2, name: "김철수", age: 32 },
];

<Grid columns={columns} rows={rows} />;
```
