import { contextBridge, ipcRenderer } from "electron";
import type { DesktopApi } from "../src/shared/data-contract";

const desktopApi: DesktopApi = {
  getAppInfo: () => ({
    name: "ThirdOutcome",
    runtime: "electron"
  }),
  getSchema: () => ipcRenderer.invoke("duckdb:schema"),
  querySql: (sql: string) => ipcRenderer.invoke("duckdb:query", sql)
};

contextBridge.exposeInMainWorld("desktop", desktopApi);
