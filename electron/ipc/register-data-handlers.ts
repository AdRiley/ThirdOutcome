import { ipcMain } from "electron";
import type { DuckDbService } from "../../src/backend/duckdb/duckdb-service";

export function registerDataHandlers(service: DuckDbService): void {
  ipcMain.handle("duckdb:query", async (_event, sql: string) => service.executeQuery(sql));
  ipcMain.handle("duckdb:schema", async () => service.getSchema());
}
