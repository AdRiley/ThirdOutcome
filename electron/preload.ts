import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("desktop", {
  getAppInfo: () => ({
    name: "ThirdOutcome",
    runtime: "electron"
  }),
  getSchema: () => ipcRenderer.invoke("duckdb:schema") as Promise<
    Array<{
      tableName: string;
      columnName: string;
      dataType: string;
    }>
  >,
  querySql: (sql: string) => ipcRenderer.invoke("duckdb:query", sql) as Promise<{
    columns: string[];
    rows: Array<Record<string, unknown>>;
    rowCount: number;
  }>
});
